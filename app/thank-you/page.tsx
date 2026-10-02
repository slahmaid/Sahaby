import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { SiteHeader } from "@/components/site-header";
import { getStorefrontData } from "@/lib/google-sheets";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  type StorefrontData,
} from "@/lib/storefront-types";

export const metadata: Metadata = {
  title: "شكرًا لطلبك — صحابي",
  description: "وصل طلبك في صحابي. سنتواصل معك قريبًا لتأكيد التوصيل.",
};

const sizes: Record<string, { name: string; image: string; alt: string }> = {
  medium: {
    name: "متوسط",
    image:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&h=800&q=80",
    alt: "المقاس المتوسط",
  },
  large: {
    name: "كبير",
    image:
      "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&h=800&q=80",
    alt: "المقاس الكبير",
  },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{
    size?: string;
    name?: string;
    phone?: string;
    city?: string;
  }>;
}) {
  await connection();
  const { size, name, phone, city } = await searchParams;
  const chosen = size ? sizes[size] : undefined;
  let storefront: StorefrontData = {
    products: DEFAULT_PRODUCTS,
    settings: DEFAULT_STORE_SETTINGS,
  };
  try {
    storefront = await getStorefrontData();
  } catch (error) {
    console.error("Unable to load delivery estimate; using default:", error);
  }
  const productName = storefront.products.find((product) => product.id === size)?.name;
  const deliveryEstimate = storefront.settings.deliveryEstimate;

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 pt-28 pb-16 text-center">
        {chosen ? (
          <img
            src={chosen.image}
            alt={chosen.alt}
            className="size-44 rounded-2xl object-cover shadow-lg sm:size-56"
          />
        ) : null}
        <p className="mt-6 w-fit rounded-full bg-[#06254a] px-3 py-1 text-sm font-bold text-white">
          صحابي
        </p>
        <h1 className="mt-6 font-serif text-4xl text-[#06254a] sm:text-6xl">
          شكرًا لك
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-[#06254a]/75">
          وصل طلبك
          {chosen ? (
            <>
              {" "}
              للمقاس{" "}
              <span className="font-bold text-[#06254a]">
                {productName ?? chosen.name}
              </span>
            </>
          ) : null}
          . سنتواصل معك قريبًا لتأكيد الطلب.
        </p>
        {name || phone || city ? (
          <dl className="mt-8 w-full max-w-md divide-y divide-[#06254a]/10 rounded-2xl border-2 border-[#06254a] bg-white text-start">
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-[#06254a]/60">الاسم</dt>
              <dd className="font-bold text-[#06254a]">{name || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-[#06254a]/60">المدينة</dt>
              <dd className="font-bold text-[#06254a]">{city || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-[#06254a]/60">رقم الهاتف</dt>
              <dd className="font-bold text-[#06254a]" dir="ltr">
                {phone || "—"}
              </dd>
            </div>
          </dl>
        ) : null}
        <p className="mt-6 max-w-md text-sm leading-relaxed text-[#06254a]/75">
          {deliveryEstimate}
          {city ? (
            <>
              {" "}
              حسب مدينة <span className="font-bold text-[#06254a]">{city}</span>
            </>
          ) : (
            " حسب المدينة"
          )}
          .
        </p>
        <p className="mt-4 w-fit rounded-full border border-[#a71c32]/20 bg-[#a71c32]/10 px-4 py-1.5 text-sm font-bold text-[#a71c32]">
          التوصيل مجاني
        </p>
        <Link
          href="/"
          className="mt-10 rounded-xl bg-[#a71c32] px-6 py-3 text-sm font-bold text-white"
        >
          العودة للبداية
        </Link>
      </main>
    </>
  );
}
