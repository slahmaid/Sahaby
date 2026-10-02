"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Phone } from "lucide-react";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/orders";

const statusStyles: Record<OrderStatus, string> = {
  جديد: "bg-amber-100 text-amber-800",
  "تم التأكيد": "bg-blue-100 text-blue-800",
  "قيد التوصيل": "bg-violet-100 text-violet-800",
  مكتمل: "bg-emerald-100 text-emerald-800",
  ملغي: "bg-rose-100 text-rose-800",
};

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ar-MA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function AdminOrders({
  orders,
  products,
}: {
  orders: Order[];
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [busyOrderId, setBusyOrderId] = useState("");
  const [error, setError] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "الكل" || order.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [order.name, order.phone, order.city, order.id]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  async function changeStatus(id: string, status: OrderStatus) {
    setBusyOrderId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "تعذر تحديث حالة الطلب.");
      }
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "تعذر تحديث حالة الطلب.",
      );
    } finally {
      setBusyOrderId("");
    }
  }

  function exportOrders() {
    const columns = [
      "معرّف الطلب",
      "الاسم",
      "رقم الهاتف",
      "المدينة",
      "المقاس",
      "التاريخ",
      "الحالة",
    ];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.name,
      order.phone,
      order.city,
      products.find((product) => product.id === order.size)?.name ??
        (order.size === "large" ? "كبير" : "متوسط"),
      order.createdAt,
      order.status,
    ]);
    const csv = [columns, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sahaby-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-[#06254a]/[0.08] bg-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#06254a]/10 p-5">
            <div>
              <h2 className="text-xl font-black text-[#06254a]">الطلبات</h2>
              <p className="mt-1 text-sm text-[#06254a]/60">
                {filteredOrders.length} من {orders.length} طلب
              </p>
            </div>
            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-[minmax(14rem,1fr)_auto_auto]">
              <label className="sr-only" htmlFor="order-search">
                ابحث بالاسم أو الهاتف أو المدينة
              </label>
              <input
                className="min-w-0 rounded-xl border border-[#06254a]/15 px-4 py-3 text-base outline-none focus:border-[#a71c32] sm:py-2.5 sm:text-sm"
                id="order-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الهاتف أو المدينة"
                value={search}
              />
              <label className="sr-only" htmlFor="status-filter">
                تصفية حسب الحالة
              </label>
              <select
                className="w-full rounded-xl border border-[#06254a]/15 bg-white px-4 py-3 text-base outline-none focus:border-[#a71c32] sm:w-auto sm:py-2.5 sm:text-sm"
                id="status-filter"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option>الكل</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <button
                className="rounded-xl border border-[#06254a]/15 px-4 py-3 text-sm font-bold text-[#06254a] transition hover:bg-[#06254a]/[0.04] sm:py-2.5"
                onClick={exportOrders}
                type="button"
              >
                تصدير CSV
              </button>
            </div>
          </div>

          {error ? (
            <p
              className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {filteredOrders.length ? (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {filteredOrders.map((order) => (
                  <article
                    className="rounded-xl border border-[#06254a]/[0.08] bg-white p-4 shadow-sm"
                    key={order.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-[#06254a]">
                          {order.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#06254a]/55">
                          {order.city} ·{" "}
                          {products.find((product) => product.id === order.size)
                            ?.name ??
                            (order.size === "large" ? "كبير" : "متوسط")}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-[#06254a]/45">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#06254a]/[0.07] pt-3">
                      <a
                        className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-sm font-bold text-emerald-800"
                        dir="ltr"
                        href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}
                      >
                        <Phone aria-hidden="true" className="size-4 shrink-0" />
                        <span className="truncate">{order.phone}</span>
                      </a>
                      <span className="shrink-0 text-[11px] text-[#06254a]/50">
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </div>
                    <label className="mt-3 block text-xs font-bold text-[#06254a]/60">
                      حالة الطلب
                      <select
                        aria-label={`حالة طلب ${order.name}`}
                        className={`mt-1.5 min-h-11 w-full rounded-lg px-3 text-sm font-bold outline-none ${statusStyles[order.status]}`}
                        disabled={busyOrderId === order.id}
                        onChange={(event) =>
                          void changeStatus(
                            order.id,
                            event.target.value as OrderStatus,
                          )
                        }
                        value={order.status}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-start text-sm">
                <thead className="bg-[#06254a]/[0.03] text-[#06254a]/65">
                  <tr>
                    <th className="px-5 py-4 font-bold">الطلب</th>
                    <th className="px-5 py-4 font-bold">العميل</th>
                    <th className="px-5 py-4 font-bold">رقم الهاتف</th>
                    <th className="px-5 py-4 font-bold">المدينة</th>
                    <th className="px-5 py-4 font-bold">المقاس</th>
                    <th className="px-5 py-4 font-bold">تاريخ الطلب</th>
                    <th className="px-5 py-4 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#06254a]/[0.07]">
                  {filteredOrders.map((order) => (
                    <tr className="hover:bg-[#06254a]/[0.02]" key={order.id}>
                      <td className="px-5 py-4 font-mono text-xs text-[#06254a]/55">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#06254a]">
                        {order.name}
                      </td>
                      <td className="px-5 py-4" dir="ltr">
                        <a
                          className="font-semibold text-[#06254a] underline decoration-[#06254a]/20 underline-offset-2 hover:text-[#a71c32]"
                          href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}
                        >
                          {order.phone}
                        </a>
                      </td>
                      <td className="px-5 py-4">{order.city}</td>
                      <td className="px-5 py-4">
                        {products.find((product) => product.id === order.size)
                          ?.name ?? (order.size === "large" ? "كبير" : "متوسط")}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#06254a]/65">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`حالة طلب ${order.name}`}
                          className={`rounded-full px-3 py-2 text-xs font-bold outline-none ${statusStyles[order.status]}`}
                          disabled={busyOrderId === order.id}
                          onChange={(event) =>
                            void changeStatus(
                              order.id,
                              event.target.value as OrderStatus,
                            )
                          }
                          value={order.status}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : (
            <div className="px-5 py-16 text-center">
              <p className="font-bold text-[#06254a]">
                {orders.length ? "لا توجد طلبات مطابقة للبحث." : "لا توجد طلبات بعد."}
              </p>
              <p className="mt-2 text-sm text-[#06254a]/60">
                ستظهر الطلبات الجديدة هنا بعد إرسالها من الموقع.
              </p>
            </div>
          )}
    </section>
  );
}
