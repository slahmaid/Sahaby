"use client";

import {
  BarChart3,
  Boxes,
  Check,
  ChevronLeft,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ORDER_STATUSES, type Order } from "@/lib/orders";
import type {
  ProductId,
  StoreProduct,
  StoreSettings,
} from "@/lib/storefront-types";
import { AdminOrders } from "@/components/admin-orders";

type SectionId = "overview" | "orders" | "products" | "content" | "settings";

const sections = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "orders", label: "الطلبات", icon: ClipboardList },
  { id: "products", label: "المنتجات والمخزون", icon: Boxes },
  { id: "content", label: "محتوى الصفحة", icon: MessageSquareText },
  { id: "settings", label: "إعدادات المتجر", icon: Settings2 },
] as const;

const mobileSectionLabels: Record<SectionId, string> = {
  overview: "الرئيسية",
  orders: "الطلبات",
  products: "المخزون",
  content: "المحتوى",
  settings: "الإعدادات",
};

function formatDate(value: string) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("ar-MA", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(date)
    : "—";
}

function Overview({
  orders,
  products,
  onShowOrders,
}: {
  orders: Order[];
  products: StoreProduct[];
  onShowOrders: () => void;
}) {
  const newOrders = orders.filter((order) => order.status === "جديد");
  const deliveryOrders = orders.filter(
    (order) => order.status === "قيد التوصيل",
  );
  const completedOrders = orders.filter((order) => order.status === "مكتمل");
  const lowStock = products.filter(
    (product) => product.active && product.stock !== null && product.stock <= 5,
  );
  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((item) => item.count));
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "إجمالي الطلبات",
            value: orders.length,
            hint: "كل الطلبات المسجلة",
            icon: ClipboardList,
            color: "text-[#06254a] bg-blue-50",
          },
          {
            label: "تحتاج تأكيدًا",
            value: newOrders.length,
            hint: "طلبات جديدة بانتظار الاتصال",
            icon: MessageSquareText,
            color: "text-amber-700 bg-amber-50",
          },
          {
            label: "قيد التوصيل",
            value: deliveryOrders.length,
            hint: "طلبات وصلت إلى شركة التوصيل",
            icon: Boxes,
            color: "text-violet-700 bg-violet-50",
          },
          {
            label: "طلبات مكتملة",
            value: completedOrders.length,
            hint: "تم تسليمها للعميل",
            icon: Check,
            color: "text-emerald-700 bg-emerald-50",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-4 shadow-sm sm:p-5"
              key={card.label}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#06254a]/60">
                  {card.label}
                </p>
                <span className={`rounded-xl p-2 ${card.color}`}>
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-[#06254a]">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-[#06254a]/50">{card.hint}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <article className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-2 text-[#06254a]">
              <BarChart3 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-[#06254a]">حالة الطلبات</h2>
              <p className="mt-1 text-xs text-[#06254a]/55">
                نظرة على جميع الطلبات المسجلة
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {statusCounts.map(({ status, count }) => (
              <div key={status}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-[#06254a]/75">{status}</span>
                  <span className="font-bold text-[#06254a]">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#06254a]/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#a71c32] transition-all"
                    style={{
                      width: `${(count / maxStatusCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-6 flex items-center gap-1 text-sm font-bold text-[#a71c32]"
            onClick={onShowOrders}
            type="button"
          >
            إدارة الطلبات <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
        </article>

        <article className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-rose-50 p-2 text-[#a71c32]">
                <ClipboardList aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-black text-[#06254a]">أحدث الطلبات</h2>
                <p className="mt-1 text-xs text-[#06254a]/55">
                  آخر الطلبات الواردة إلى المتجر
                </p>
              </div>
            </div>
            <button
              className="text-sm font-bold text-[#a71c32]"
              onClick={onShowOrders}
              type="button"
            >
              عرض الكل
            </button>
          </div>
          {recentOrders.length ? (
            <div className="mt-5 divide-y divide-[#06254a]/[0.07]">
              {recentOrders.map((order) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  key={order.id}
                >
                  <div>
                    <p className="text-sm font-bold text-[#06254a]">
                      {order.name}
                    </p>
                    <p className="mt-1 text-xs text-[#06254a]/55">
                      {order.city} ·{" "}
                      {products.find((product) => product.id === order.size)
                        ?.name ?? (order.size === "large" ? "كبير" : "متوسط")}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="rounded-full bg-[#06254a]/[0.06] px-2.5 py-1 text-xs font-semibold text-[#06254a]/75">
                      {order.status}
                    </span>
                    <p className="mt-1.5 text-xs text-[#06254a]/50">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-[#06254a]/[0.03] px-4 py-7 text-center text-sm text-[#06254a]/55">
              ستظهر هنا أحدث الطلبات بعد ورودها.
            </p>
          )}
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-[#06254a]">تنبيهات المخزون</h2>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
              {lowStock.length} تنبيه
            </span>
          </div>
          {lowStock.length ? (
            <div className="mt-4 space-y-3">
              {lowStock.map((product) => (
                <div
                  className="flex items-center justify-between rounded-xl bg-rose-50/70 px-4 py-3"
                  key={product.id}
                >
                  <span className="font-semibold text-[#06254a]">
                    المقاس {product.name}
                  </span>
                  <span className="text-sm font-black text-rose-700">
                    متبقي {product.stock}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              لا توجد تنبيهات مخزون حاليًا.
            </p>
          )}
        </article>
        <article className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm">
          <h2 className="font-black text-[#06254a]">نظرة على المنتجات</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                className="rounded-xl border border-[#06254a]/[0.08] p-4"
                key={product.id}
              >
                <p className="font-bold text-[#06254a]">{product.name}</p>
                <p className="mt-2 text-sm text-[#06254a]/60">
                  {product.active ? "معروض للبيع" : "مخفي"}
                </p>
                <p className="mt-1 text-xs text-[#06254a]/55">
                  {product.stock === null
                    ? "المخزون غير محدد"
                    : `${product.stock} قطعة في المخزون`}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ProductsPanel({
  products,
  onSaved,
}: {
  products: StoreProduct[];
  onSaved: (message: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<ProductId, StoreProduct>>(
    () =>
      Object.fromEntries(
        products.map((product) => [product.id, product]),
      ) as Record<ProductId, StoreProduct>,
  );
  const [stockValues, setStockValues] = useState<Record<ProductId, string>>(
    () =>
      Object.fromEntries(
        products.map((product) => [
          product.id,
          product.stock === null ? "" : String(product.stock),
        ]),
      ) as Record<ProductId, string>,
  );
  const [savingId, setSavingId] = useState<ProductId | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateDraft(
    id: ProductId,
    changes: Partial<StoreProduct>,
  ) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...changes },
    }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>, id: ProductId) {
    event.preventDefault();
    setSavingId(id);
    setError("");
    setSuccess("");
    const stockText = stockValues[id].trim();
    const stock = stockText === "" ? null : Number(stockText);

    try {
      if (
        stock !== null &&
        (!Number.isSafeInteger(stock) || stock < 0 || stock > 1_000_000)
      ) {
        throw new Error("أدخل كمية مخزون صحيحة أو اترك الحقل فارغًا.");
      }
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...drafts[id], stock }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "تعذر حفظ المنتج.");

      setSuccess(`تم حفظ إعدادات المقاس ${drafts[id].name}.`);
      onSaved("تم حفظ إعدادات المنتجات والمخزون.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ المنتج.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-[#06254a]">المنتجات والمخزون</h2>
        <p className="mt-1 text-sm text-[#06254a]/60">
          عدّل السعر والكمية وحالة العرض لكل مقاس. يُخصم المخزون عند تأكيد الطلب.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">
          {success}
        </p>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {products.map((product) => {
          const draft = drafts[product.id] ?? product;
          return (
            <form
              className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm sm:p-6"
              key={product.id}
              onSubmit={(event) => void saveProduct(event, product.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#a71c32]">منتج صحابي</p>
                  <h3 className="mt-1 text-xl font-black text-[#06254a]">
                    المقاس {product.name}
                  </h3>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#06254a]">
                  <input
                    checked={draft.active}
                    className="size-4 accent-[#a71c32]"
                    onChange={(event) =>
                      updateDraft(product.id, { active: event.target.checked })
                    }
                    type="checkbox"
                  />
                  معروض للبيع
                </label>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#06254a]">
                  اسم المقاس
                  <input
                    className="mt-2 w-full rounded-xl border border-[#06254a]/15 px-3 py-2.5 outline-none focus:border-[#a71c32]"
                    maxLength={60}
                    onChange={(event) =>
                      updateDraft(product.id, { name: event.target.value })
                    }
                    required
                    value={draft.name}
                  />
                </label>
                <label className="text-sm font-semibold text-[#06254a]">
                  السعر (درهم)
                  <input
                    className="mt-2 w-full rounded-xl border border-[#06254a]/15 px-3 py-2.5 outline-none focus:border-[#a71c32]"
                    min="0"
                    onChange={(event) =>
                      updateDraft(product.id, { price: Number(event.target.value) })
                    }
                    required
                    step="0.01"
                    type="number"
                    value={draft.price}
                  />
                </label>
                <label className="text-sm font-semibold text-[#06254a] sm:col-span-2">
                  الكمية المتوفرة
                  <input
                    className="mt-2 w-full rounded-xl border border-[#06254a]/15 px-3 py-2.5 outline-none focus:border-[#a71c32]"
                    min="0"
                    onChange={(event) =>
                      setStockValues((current) => ({
                        ...current,
                        [product.id]: event.target.value,
                      }))
                    }
                    placeholder="فارغ = مخزون غير محدود"
                    step="1"
                    type="number"
                    value={stockValues[product.id]}
                  />
                  <span className="mt-1 block text-xs font-normal text-[#06254a]/55">
                    يخصم النظام قطعة عند تأكيد الطلب، ويعيدها عند إلغاء طلب مؤكد.
                  </span>
                </label>
              </div>
              <button
                className="mt-5 w-full rounded-xl bg-[#06254a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0a376d] disabled:opacity-60"
                disabled={savingId === product.id}
                type="submit"
              >
                {savingId === product.id ? "جارٍ الحفظ..." : "حفظ المنتج والمخزون"}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

const settingFields: {
  key: keyof StoreSettings;
  label: string;
  help: string;
  multiline?: boolean;
}[] = [
  {
    key: "heroTitle",
    label: "العنوان الرئيسي",
    help: "العنوان الأول الظاهر في أعلى الصفحة.",
  },
  {
    key: "heroHighlight",
    label: "الكلمة المميزة",
    help: "تظهر بجانب كلمة «مع» في العنوان.",
  },
  {
    key: "heroDescription",
    label: "وصف المنتج",
    help: "الفقرة التعريفية أسفل العنوان.",
    multiline: true,
  },
  {
    key: "socialProof",
    label: "عبارة الثقة القصيرة",
    help: "العبارة القصيرة أسفل وصف المنتج.",
  },
  {
    key: "orderTitle",
    label: "عنوان قسم الطلب",
    help: "عنوان نموذج الطلب.",
  },
  {
    key: "orderDescription",
    label: "نص توضيحي للطلب",
    help: "التعليمات التي تظهر أعلى نموذج الطلب.",
    multiline: true,
  },
  {
    key: "shippingMessage",
    label: "رسالة التوصيل",
    help: "تظهر قرب السعر وفي شريط الطلب على الهاتف.",
  },
  {
    key: "deliveryEstimate",
    label: "مدة التوصيل",
    help: "النص الذي يظهر في صفحة الشكر بعد الطلب.",
  },
  {
    key: "faqContent",
    label: "الأسئلة الشائعة",
    help: "سطر لكل سؤال بصيغة: السؤال|الجواب. اترك الأسئلة التي لا تريد عرضها دون سطر.",
    multiline: true,
  },
  {
    key: "reviewContent",
    label: "تجارب العملاء",
    help: "اختياري. أضف تجارب حقيقية بموافقة أصحابها، سطر لكل تجربة بصيغة: الاسم|الصفة أو المدينة|نص التجربة. اتركه فارغًا لإخفاء القسم.",
    multiline: true,
  },
];

function ContentPanel({
  settings,
  onSaved,
}: {
  settings: StoreSettings;
  onSaved: (message: string) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/storefront", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "تعذر حفظ محتوى الصفحة.");
      }
      setSuccess("تم حفظ التغييرات. حدّث صفحة المتجر لرؤية النصوص الجديدة.");
      onSaved("تم حفظ محتوى صفحة المتجر.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "تعذر حفظ محتوى الصفحة.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h2 className="text-xl font-black text-[#06254a]">محتوى الصفحة الرئيسية</h2>
        <p className="mt-1 text-sm text-[#06254a]/60">
          عدّل النصوص التي يراها العملاء. لا تغيّر هذه الحقول الصور أو ترتيب الأقسام.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">
          {success}
        </p>
      ) : null}
      <form
        className="grid gap-4 rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6"
        onSubmit={saveSettings}
      >
        {settingFields.map(({ key, label, help, multiline }) => (
          <label
            className={`text-sm font-bold text-[#06254a] ${multiline ? "sm:col-span-2" : ""}`}
            key={key}
          >
            {label}
            {multiline ? (
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-[#06254a]/15 px-3 py-2.5 font-normal leading-6 outline-none focus:border-[#a71c32]"
                maxLength={
                  key === "faqContent" || key === "reviewContent" ? 5000 : 500
                }
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                required={key !== "reviewContent"}
                value={draft[key]}
              />
            ) : (
              <input
                className="mt-2 w-full rounded-xl border border-[#06254a]/15 px-3 py-2.5 font-normal outline-none focus:border-[#a71c32]"
                maxLength={
                  key === "faqContent" || key === "reviewContent" ? 5000 : 500
                }
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                required
                value={draft[key]}
              />
            )}
            <span className="mt-1 block text-xs font-normal text-[#06254a]/55">
              {help}
            </span>
          </label>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <p className="text-xs text-[#06254a]/55">
            ستُحفظ الإعدادات في ورقة StoreSettings داخل Google Sheets.
          </p>
          <button
            className="rounded-xl bg-[#06254a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a376d] disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "جارٍ الحفظ..." : "حفظ محتوى الصفحة"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StoreSettingsPanel() {
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h2 className="text-xl font-black text-[#06254a]">إعدادات المتجر</h2>
        <p className="mt-1 text-sm text-[#06254a]/60">
          حالة الاتصالات وطريقة عمل الطلبات والمخزون.
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="font-black text-[#06254a]">Google Sheets</h3>
              <p className="mt-1 text-sm text-emerald-700">متصل</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#06254a]/60">
            الطلبات والمنتجات وإعدادات الصفحة محفوظة في جدول بيانات خاص. لا تُعرض
            مفاتيح الخدمة في لوحة الإدارة.
          </p>
        </article>
        <article className="rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-2 text-[#06254a]">
              <Store aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="font-black text-[#06254a]">سير الطلب والمخزون</h3>
              <p className="mt-1 text-sm text-[#06254a]/55">تأكيد يدوي قبل الخصم</p>
            </div>
          </div>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-[#06254a]/70">
            <li>١. يصل الطلب الجديد إلى جدول الطلبات دون حجز قطعة.</li>
            <li>٢. عند اختيار «تم التأكيد»، تُخصم قطعة من المخزون المحدد.</li>
            <li>٣. إلغاء طلب مؤكد يعيد القطعة إلى المخزون تلقائيًا.</li>
          </ol>
        </article>
      </section>
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        لتغيير كلمة مرور الإدارة أو بيانات اتصال Google، عدّل متغيرات الخادم في
        ملف .env.local ثم أعد تشغيل التطبيق. لا تُدخل هذه الأسرار في لوحة الإدارة.
      </p>
    </div>
  );
}

export function AdminDashboard({
  orders,
  products,
  settings,
}: {
  orders: Order[];
  products: StoreProduct[];
  settings: StoreSettings;
}) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selectedSection = sections.find((item) => item.id === activeSection)!;
  const SectionIcon = selectedSection.icon;
  const content = useMemo(() => {
    switch (activeSection) {
      case "overview":
        return (
          <Overview
            onShowOrders={() => setActiveSection("orders")}
            orders={orders}
            products={products}
          />
        );
      case "orders":
        return <AdminOrders orders={orders} products={products} />;
      case "products":
        return (
          <ProductsPanel
            key={JSON.stringify(products)}
            onSaved={(message) => {
              setNotice(message);
              router.refresh();
            }}
            products={products}
          />
        );
      case "content":
        return (
          <ContentPanel
            key={JSON.stringify(settings)}
            onSaved={(message) => {
              setNotice(message);
              router.refresh();
            }}
            settings={settings}
          />
        );
      case "settings":
        return <StoreSettingsPanel />;
    }
  }, [activeSection, orders, products, router, settings]);

  async function signOut() {
    setIsSigningOut(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("تعذر تسجيل الخروج.");
      router.refresh();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "تعذر تسجيل الخروج.",
      );
      setIsSigningOut(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f5f7fb] text-[#06254a]"
      dir="rtl"
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-s border-[#06254a]/[0.08] bg-white p-5 lg:flex lg:flex-col">
          <Link className="flex items-center gap-3 px-2 py-3" href="/">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#06254a] text-lg font-black text-white">
              ص
            </span>
            <span>
              <span className="block font-black text-[#06254a]">صحابي</span>
              <span className="mt-0.5 block text-xs text-[#06254a]/50">
                لوحة إدارة المتجر
              </span>
            </span>
          </Link>
          <nav aria-label="أقسام لوحة الإدارة" className="mt-9 space-y-1.5">
            {sections.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-bold transition ${
                    active
                      ? "bg-[#06254a] text-white shadow-sm"
                      : "text-[#06254a]/65 hover:bg-[#06254a]/[0.05] hover:text-[#06254a]"
                  }`}
                  key={id}
                  onClick={() => {
                    setActiveSection(id);
                    setNotice("");
                    setError("");
                  }}
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-[18px]" />
                  {label}
                  {id === "orders" &&
                  orders.some((order) => order.status === "جديد") ? (
                    <span
                      className={`ms-auto min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs ${
                        active ? "bg-white/15 text-white" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {orders.filter((order) => order.status === "جديد").length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#06254a]/[0.04] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#06254a]">
              <span className="size-2 rounded-full bg-emerald-500" />
              المتجر يعمل
            </div>
            <p className="mt-2 text-xs leading-5 text-[#06254a]/55">
              المنتجات والطلبات متصلة بجدول Google Sheets.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#06254a]/[0.08] bg-white/95 px-4 py-3 backdrop-blur sm:px-7 lg:px-9">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-xl bg-[#06254a]/[0.05] p-2.5 text-[#06254a]">
                  <SectionIcon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#06254a]">
                    {selectedSection.label}
                  </p>
                  <p className="mt-0.5 hidden text-xs text-[#06254a]/50 sm:block">
                    إدارة صحابي للتجارة الإلكترونية
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  aria-label="عرض المتجر"
                  className="flex items-center gap-2 rounded-xl border border-[#06254a]/10 p-2.5 text-xs font-bold text-[#06254a] transition hover:bg-[#06254a]/[0.04] sm:px-3 sm:py-2.5"
                  href="/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">عرض المتجر</span>
                </Link>
                <button
                  aria-label="تحديث الصفحة"
                  className="rounded-xl border border-[#06254a]/10 p-2.5 text-[#06254a]/65 transition hover:bg-[#06254a]/[0.04]"
                  onClick={() => router.refresh()}
                  title="تحديث البيانات"
                  type="button"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#06254a] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#0a376d] disabled:opacity-60 sm:px-4 sm:text-sm"
                  disabled={isSigningOut}
                  onClick={signOut}
                  type="button"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">
                    {isSigningOut ? "جارٍ الخروج..." : "خروج"}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <div className="px-3 py-5 pb-28 sm:px-7 sm:py-8 sm:pb-28 lg:px-9 lg:pb-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#a71c32]">صحابي · الإدارة</p>
                <h1 className="mt-1 text-2xl font-black text-[#06254a] sm:text-3xl">
                  {activeSection === "overview"
                    ? "مرحبًا بك في متجرك"
                    : selectedSection.label}
                </h1>
              </div>
              {activeSection === "overview" ? (
                <p className="text-xs text-[#06254a]/50">
                  {orders.length} طلب مسجل
                </p>
              ) : null}
            </div>
            {error ? (
              <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">
                {notice}
              </p>
            ) : null}
            {content}
          </div>
        </div>
      </div>
      <nav
        aria-label="التنقل بين أقسام الإدارة"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#06254a]/10 bg-white/95 px-1 pt-1.5 shadow-[0_-8px_24px_rgba(6,37,74,0.08)] backdrop-blur lg:hidden"
        style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-0.5">
          {sections.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            const newOrderCount =
              id === "orders"
                ? orders.filter((order) => order.status === "جديد").length
                : 0;
            return (
              <button
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className={`relative flex min-w-0 min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-bold transition ${
                  active ? "text-[#a71c32]" : "text-[#06254a]/55"
                }`}
                key={id}
                onClick={() => {
                  setActiveSection(id);
                  setNotice("");
                  setError("");
                }}
                type="button"
              >
                <Icon aria-hidden="true" className="size-[18px]" />
                <span className="truncate">{mobileSectionLabels[id]}</span>
                {newOrderCount > 0 ? (
                  <span className="absolute end-1/4 top-0.5 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[9px] leading-4 text-white">
                    {newOrderCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
