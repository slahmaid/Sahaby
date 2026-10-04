import { createSign, randomUUID } from "node:crypto";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/orders";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  LEGACY_SAMPLE_REVIEW_CONTENT,
  PRODUCT_IDS,
  type ProductId,
  type StoreProduct,
  type StoreSettings,
  type StorefrontData,
} from "@/lib/storefront-types";

export type { Order, OrderStatus } from "@/lib/orders";
export type {
  ProductId,
  StoreProduct,
  StoreSettings,
  StorefrontData,
} from "@/lib/storefront-types";

const SHEET_NAME = "Orders";
const INVENTORY_SHEET_NAME = "Inventory";
const SETTINGS_SHEET_NAME = "StoreSettings";
const ORDER_COLUMNS = [
  "معرّف الطلب",
  "تاريخ الطلب",
  "الاسم",
  "رقم الهاتف",
  "المدينة",
  "المقاس",
  "الحالة",
];
const INVENTORY_COLUMNS = [
  "المعرّف",
  "المقاس",
  "السعر بالدرهم",
  "المخزون",
  "متاح للبيع",
];
const SETTINGS_COLUMNS = ["المفتاح", "القيمة"];
const SETTINGS_KEYS = Object.keys(
  DEFAULT_STORE_SETTINGS,
) as (keyof StoreSettings)[];
const SHEET_READ_RANGE = `${SHEET_NAME}!A1:G10000`;
const INVENTORY_READ_RANGE = `${INVENTORY_SHEET_NAME}!A1:E100`;
const SETTINGS_READ_RANGE = `${SETTINGS_SHEET_NAME}!A1:B100`;
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

type SheetProperty = { sheetId?: number; title?: string };
type SheetValue =
  | { stringValue: string }
  | { numberValue: number }
  | { boolValue: boolean };

let cachedToken: { value: string; expiresAt: number } | undefined;
let sheetIdsPromise: Promise<Map<string, number>> | undefined;

function getSheetsConfig() {
  const {
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_SHEETS_SPREADSHEET_ID,
  } = process.env;

  if (
    !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    !GOOGLE_SHEETS_SPREADSHEET_ID
  ) {
    throw new Error(
      "Configure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHEET_ID.",
    );
  }

  return {
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
  };
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { email, privateKey } = getSheetsConfig();
  const issuedAt = Math.floor(Date.now() / 1000);
  const assertionHeader = encodeBase64Url(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );
  const assertionPayload = encodeBase64Url(
    JSON.stringify({
      iss: email,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  );
  const unsignedAssertion = `${assertionHeader}.${assertionPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedAssertion);
  signer.end();
  const assertion = `${unsignedAssertion}.${signer
    .sign(privateKey)
    .toString("base64url")}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google authentication failed (${response.status}).`);
  }

  const result = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!result.access_token || !result.expires_in) {
    throw new Error("Google authentication returned an invalid access token.");
  }

  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + result.expires_in * 1000,
  };
  return result.access_token;
}

async function sheetsRequest<T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string>,
): Promise<T> {
  const { spreadsheetId } = getSheetsConfig();
  const accessToken = await getAccessToken();
  const queryString = new URLSearchParams(query).toString();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    const message =
      typeof details?.error?.message === "string"
        ? details.error.message
        : `Google Sheets request failed (${response.status}).`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function valuesPath(range: string) {
  return `/values/${encodeURIComponent(range)}`;
}

async function getSheetIds() {
  if (!sheetIdsPromise) {
    sheetIdsPromise = (async () => {
      const spreadsheet = await sheetsRequest<{
        sheets?: { properties?: SheetProperty }[];
      }>("", undefined, { fields: "sheets(properties(sheetId,title))" });
      const sheetIds = new Map<string, number>();

      for (const sheet of spreadsheet.sheets ?? []) {
        const { sheetId, title } = sheet.properties ?? {};
        if (title && sheetId !== undefined) sheetIds.set(title, sheetId);
      }

      const requiredSheets = [
        SHEET_NAME,
        INVENTORY_SHEET_NAME,
        SETTINGS_SHEET_NAME,
      ];
      const missingSheets = requiredSheets.filter((title) => !sheetIds.has(title));

      if (missingSheets.length) {
        const result = await sheetsRequest<{
          replies?: { addSheet?: { properties?: SheetProperty } }[];
        }>(":batchUpdate", {
          method: "POST",
          body: JSON.stringify({
            requests: missingSheets.map((title) => ({
              addSheet: { properties: { title } },
            })),
          }),
        });

        for (const reply of result.replies ?? []) {
          const { sheetId, title } = reply.addSheet?.properties ?? {};
          if (title && sheetId !== undefined) sheetIds.set(title, sheetId);
        }
      }

      for (const title of requiredSheets) {
        if (!sheetIds.has(title)) {
          throw new Error(`Unable to initialize the "${title}" Google Sheets tab.`);
        }
      }
      return sheetIds;
    })();
  }

  try {
    return await sheetIdsPromise;
  } catch (error) {
    sheetIdsPromise = undefined;
    throw error;
  }
}

async function getSheetId(title: string) {
  const sheetId = (await getSheetIds()).get(title);
  if (sheetId === undefined) {
    throw new Error(`Google spreadsheet is missing the "${title}" tab.`);
  }
  return sheetId;
}

async function appendRows(sheetId: number, rows: SheetValue[][]) {
  await sheetsRequest(":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          appendCells: {
            sheetId,
            rows: rows.map((values) => ({
              values: values.map((userEnteredValue) => ({ userEnteredValue })),
            })),
            fields: "userEnteredValue",
          },
        },
      ],
    }),
  });
}

async function updateCells(
  requests: {
    sheetId: number;
    rowIndex: number;
    columnIndex: number;
    values: SheetValue[];
  }[],
) {
  if (!requests.length) return;

  await sheetsRequest(":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: requests.map(({ sheetId, rowIndex, columnIndex, values }) => ({
        updateCells: {
          start: { sheetId, rowIndex, columnIndex },
          rows: [{ values: values.map((userEnteredValue) => ({ userEnteredValue })) }],
          fields: "userEnteredValue",
        },
      })),
    }),
  });
}

function stringValue(value: string): SheetValue {
  return { stringValue: value };
}

function parseProduct(row: string[]): StoreProduct | undefined {
  const [id, name, price, stock, active] = row;
  if (!PRODUCT_IDS.includes(id as ProductId)) return undefined;

  const parsedPrice = Number(price);
  const parsedStock = stock === "" || stock === undefined ? null : Number(stock);
  return {
    id: id as ProductId,
    name: name || (id === "large" ? "كبير" : "متوسط"),
    price: Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 999,
    stock:
      parsedStock !== null &&
      Number.isSafeInteger(parsedStock) &&
      parsedStock >= 0
        ? parsedStock
        : null,
    active: active !== "FALSE",
  };
}

function productValues(product: StoreProduct): SheetValue[] {
  return [
    stringValue(product.id),
    stringValue(product.name),
    { numberValue: product.price },
    product.stock === null
      ? stringValue("")
      : { numberValue: product.stock },
    { boolValue: product.active },
  ];
}

async function getProductsAndRows() {
  const sheetId = await getSheetId(INVENTORY_SHEET_NAME);
  const result = await sheetsRequest<{ values?: string[][] }>(
    valuesPath(INVENTORY_READ_RANGE),
  );
  const rows = result.values ?? [];
  if (!rows.length) {
    await appendRows(sheetId, [
      INVENTORY_COLUMNS.map(stringValue),
      ...DEFAULT_PRODUCTS.map(productValues),
    ]);
    return {
      sheetId,
      rows: [
        INVENTORY_COLUMNS,
        ...DEFAULT_PRODUCTS.map((product) => [
          product.id,
          product.name,
          String(product.price),
          "",
          "TRUE",
        ]),
      ],
    };
  }

  return { sheetId, rows };
}

async function getSettingsRows() {
  const sheetId = await getSheetId(SETTINGS_SHEET_NAME);
  const result = await sheetsRequest<{ values?: string[][] }>(
    valuesPath(SETTINGS_READ_RANGE),
  );
  const rows = result.values ?? [];
  if (!rows.length) {
    const initialRows = [
      SETTINGS_COLUMNS.map(stringValue),
      ...SETTINGS_KEYS.map((key) => [
        stringValue(key),
        stringValue(DEFAULT_STORE_SETTINGS[key]),
      ]),
    ];
    await appendRows(sheetId, initialRows);
    return {
      sheetId,
      rows: [
        SETTINGS_COLUMNS,
        ...SETTINGS_KEYS.map((key) => [key, DEFAULT_STORE_SETTINGS[key]]),
      ],
    };
  }

  const keys = new Set(rows.slice(1).map((row) => row[0]));
  const missingKeys = SETTINGS_KEYS.filter((key) => !keys.has(key));
  if (missingKeys.length) {
    await appendRows(
      sheetId,
      missingKeys.map((key) => [
        stringValue(key),
        stringValue(DEFAULT_STORE_SETTINGS[key]),
      ]),
    );
    rows.push(...missingKeys.map((key) => [key, DEFAULT_STORE_SETTINGS[key]]));
  }

  return { sheetId, rows };
}

export async function getStorefrontData(): Promise<StorefrontData> {
  const [inventory, settingsData] = await Promise.all([
    getProductsAndRows(),
    getSettingsRows(),
  ]);
  const foundProducts = inventory.rows
    .slice(1)
    .map(parseProduct)
    .filter((product): product is StoreProduct => Boolean(product));
  const products = DEFAULT_PRODUCTS.map(
    (defaultProduct) =>
      foundProducts.find((product) => product.id === defaultProduct.id) ??
      defaultProduct,
  );
  const settings = { ...DEFAULT_STORE_SETTINGS };

  for (const [key, value] of settingsData.rows.slice(1)) {
    if (key in settings && typeof value === "string") {
      if (
        key === "reviewContent" &&
        value.trim() === LEGACY_SAMPLE_REVIEW_CONTENT
      ) {
        continue;
      }
      settings[key as keyof StoreSettings] = value;
    }
  }

  return { products, settings };
}

export async function updateProduct(product: StoreProduct) {
  const { sheetId, rows } = await getProductsAndRows();
  const rowIndex = rows.slice(1).findIndex((row) => row[0] === product.id) + 1;
  if (rowIndex < 1) {
    throw new Error("لم يتم العثور على المقاس في جدول المخزون.");
  }

  await updateCells([
    {
      sheetId,
      rowIndex,
      columnIndex: 0,
      values: productValues(product),
    },
  ]);
}

export async function updateStoreSettings(settings: StoreSettings) {
  const { sheetId, rows } = await getSettingsRows();
  const updates = SETTINGS_KEYS.map((key) => {
    const rowIndex = rows.findIndex((row) => row[0] === key);
    if (rowIndex < 1) {
      throw new Error(`إعداد المتجر "${key}" غير موجود في جدول البيانات.`);
    }
    return {
      sheetId,
      rowIndex,
      columnIndex: 1,
      values: [stringValue(settings[key])],
    };
  });

  await updateCells(updates);
}

async function ensureOrderHeader(orderSheetId: number) {
  const result = await sheetsRequest<{ values?: string[][] }>(
    valuesPath(`${SHEET_NAME}!A1:G1`),
  );
  if (result.values?.length) return;
  await appendRows(orderSheetId, [ORDER_COLUMNS.map(stringValue)]);
}

export async function appendOrder(
  input: Omit<Order, "id" | "createdAt" | "status">,
) {
  const storefront = await getStorefrontData();
  const product = storefront.products.find((item) => item.id === input.size);
  if (!product || !product.active) {
    throw new Error("هذا المقاس غير متاح للطلب حاليًا.");
  }
  if (product.stock !== null && product.stock <= 0) {
    throw new Error("نفد هذا المقاس مؤقتًا. يرجى اختيار المقاس الآخر.");
  }

  const order: Order = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "جديد",
  };
  const orderSheetId = await getSheetId(SHEET_NAME);

  await ensureOrderHeader(orderSheetId);
  await appendRows(orderSheetId, [
    [
      order.id,
      order.createdAt,
      order.name,
      order.phone,
      order.city,
      order.size,
      order.status,
    ].map(stringValue),
  ]);

  return order;
}

export async function listOrders(): Promise<Order[]> {
  const result = await sheetsRequest<{ values?: string[][] }>(
    valuesPath(SHEET_READ_RANGE),
  );

  return (result.values ?? [])
    .slice(1)
    .map((row) => {
      const [id, createdAt, name, phone, city, size, status] = row;
      return {
        id: id ?? "",
        createdAt: createdAt ?? "",
        name: name ?? "",
        phone: phone ?? "",
        city: city ?? "",
        size: size ?? "",
        status: ORDER_STATUSES.includes(status as OrderStatus)
          ? (status as OrderStatus)
          : "جديد",
      };
    })
    .filter((order) => order.id)
    .reverse();
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const [ordersResult, inventory] = await Promise.all([
    sheetsRequest<{ values?: string[][] }>(valuesPath(SHEET_READ_RANGE)),
    getProductsAndRows(),
  ]);
  const rows = ordersResult.values ?? [];
  const orderIndex = rows.slice(1).findIndex((row) => row[0] === id);
  if (orderIndex === -1) {
    throw new Error("لم يتم العثور على الطلب في جدول البيانات.");
  }

  const rowNumber = orderIndex + 1;
  const previousStatus = rows[rowNumber]?.[6] ?? "جديد";
  const orderSize = rows[rowNumber]?.[5];
  const committedStatuses = new Set([
    "تم التأكيد",
    "قيد التوصيل",
    "مكتمل",
  ]);
  const stockAdjustment =
    !committedStatuses.has(previousStatus) && committedStatuses.has(status)
      ? -1
      : committedStatuses.has(previousStatus) && !committedStatuses.has(status)
        ? 1
        : 0;
  const updates = [
    {
      sheetId: await getSheetId(SHEET_NAME),
      rowIndex: rowNumber,
      columnIndex: 6,
      values: [stringValue(status)],
    },
  ];

  if (stockAdjustment) {
    const productIndex = inventory.rows
      .slice(1)
      .findIndex((row) => row[0] === orderSize);
    if (productIndex < 0) {
      throw new Error("لم يتم العثور على مقاس الطلب في جدول المخزون.");
    }

    const product = parseProduct(inventory.rows[productIndex + 1]);
    if (product?.stock !== null && product?.stock !== undefined) {
      const nextStock = product.stock + stockAdjustment;
      if (nextStock < 0) {
        throw new Error("المخزون غير كافٍ لتأكيد هذا الطلب.");
      }
      updates.push({
        sheetId: inventory.sheetId,
        rowIndex: productIndex + 1,
        columnIndex: 3,
        values: [{ numberValue: nextStock }],
      });
    }
  }

  await updateCells(updates);
}
