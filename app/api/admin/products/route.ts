import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/admin-auth";
import { updateProduct } from "@/lib/google-sheets";
import { PRODUCT_IDS, type StoreProduct } from "@/lib/storefront-types";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Response.json({ error: "يرجى تسجيل الدخول مجددًا." }, { status: 401 });
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "الطلب غير مسموح." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات المنتج غير صالحة." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "بيانات المنتج غير صالحة." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const id = typeof data.id === "string" ? data.id : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const price = typeof data.price === "number" ? data.price : Number.NaN;
  const stock =
    data.stock === null
      ? null
      : typeof data.stock === "number"
        ? data.stock
        : Number.NaN;
  const active = typeof data.active === "boolean" ? data.active : undefined;

  if (
    !PRODUCT_IDS.includes(id as StoreProduct["id"]) ||
    !name ||
    name.length > 60 ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 1_000_000 ||
    (stock !== null &&
      (!Number.isSafeInteger(stock) || stock < 0 || stock > 1_000_000)) ||
    active === undefined
  ) {
    return Response.json({ error: "يرجى التحقق من بيانات المنتج والمخزون." }, { status: 400 });
  }

  try {
    await updateProduct({
      id: id as StoreProduct["id"],
      name,
      price,
      stock,
      active,
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Unable to update store product:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر حفظ المنتج في Google Sheets.",
      },
      { status: 502 },
    );
  }
}
