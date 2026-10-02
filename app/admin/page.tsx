import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/admin-auth";
import {
  getStorefrontData,
  listOrders,
  type Order,
  type StorefrontData,
} from "@/lib/google-sheets";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
} from "@/lib/storefront-types";

export const runtime = "nodejs";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return <AdminLogin />;
  }

  let orders: Order[] | undefined;
  let storefront: StorefrontData | undefined;
  let loadError: string | undefined;
  try {
    [orders, storefront] = await Promise.all([listOrders(), getStorefrontData()]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "تعذر تحميل الطلبات من Google Sheets.";
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <section className="w-full max-w-2xl rounded-3xl border border-rose-200 bg-white p-7 shadow-xl sm:p-10">
          <p className="text-sm font-bold text-[#a71c32]">صحابي</p>
          <h1 className="mt-3 text-2xl font-black text-[#06254a]">
            تعذر تحميل الطلبات
          </h1>
          <p className="mt-4 leading-7 text-[#06254a]/75">{loadError}</p>
          <p className="mt-3 text-sm leading-7 text-[#06254a]/60">
            تحقق من إعداد متغيرات Google Sheets ومن مشاركة الجدول مع حساب الخدمة.
          </p>
        </section>
      </main>
    );
  }

  return (
    <AdminDashboard
      orders={orders ?? []}
      products={storefront?.products ?? DEFAULT_PRODUCTS}
      settings={storefront?.settings ?? DEFAULT_STORE_SETTINGS}
    />
  );
}
