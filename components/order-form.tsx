"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  type StoreProduct,
  type StoreSettings,
} from "@/lib/storefront-types";

const variantImages = [
  {
    id: "medium",
    image:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&h=800&q=80",
    alt: "المقاس المتوسط",
  },
  {
    id: "large",
    image:
      "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&h=800&q=80",
    alt: "المقاس الكبير",
  },
] as const;

export function OrderForm({
  id = "order",
  products = DEFAULT_PRODUCTS,
  settings = DEFAULT_STORE_SETTINGS,
}: {
  id?: string;
  products?: StoreProduct[];
  settings?: StoreSettings;
}) {
  const router = useRouter();
  const [variant, setVariant] = useState<StoreProduct["id"]>(
    products.find((product) => product.active && product.stock !== 0)?.id ??
      products[0]?.id ??
      "medium",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const variants = variantImages.map((visual) => {
    const product = products.find((item) => item.id === visual.id);
    return {
      ...visual,
      id: visual.id,
      name: product?.name ?? (visual.id === "large" ? "كبير" : "متوسط"),
      price: `${product?.price ?? 999} درهم`,
      active: product?.active ?? true,
      outOfStock: product?.stock === 0,
    };
  });
  const selectedVariant = variants.find((item) => item.id === variant);
  const selectedUnavailable =
    !selectedVariant || !selectedVariant.active || selectedVariant.outOfStock;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (selectedUnavailable) {
      setError("هذا المقاس غير متاح حاليًا. يرجى اختيار المقاس الآخر.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    if (!name || !phone || !city) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: variant, name, phone, city }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "تعذر تسجيل طلبك. حاول مرة أخرى.");
      }

      router.push(`/thank-you?size=${encodeURIComponent(variant)}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "تعذر تسجيل طلبك. حاول مرة أخرى.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section id={id} className="px-6 pb-24">
      <div className="mx-auto w-full max-w-lg">
        <h2 className="mb-2 text-center font-serif text-3xl text-[#06254a] sm:text-4xl">
          {settings.orderTitle}
        </h2>
        <p className="mb-4 text-center text-sm text-[#06254a]/70">
          {settings.orderDescription}
        </p>
        <p className="mx-auto mb-8 w-fit rounded-full border border-[#a71c32]/20 bg-[#a71c32]/10 px-4 py-1.5 text-sm font-bold text-[#a71c32]">
          {settings.shippingMessage}
        </p>

        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <fieldset className="grid grid-cols-2 gap-4">
              <legend className="sr-only">المقاس</legend>
              {variants.map((item) => {
                const selected = variant === item.id;
                const unavailable = !item.active || item.outOfStock;
                return (
                  <label
                    key={item.id}
                    className={`overflow-hidden rounded-xl border bg-white text-center ${
                      unavailable ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                    } ${
                      selected
                        ? "border-[#a71c32] ring-2 ring-[#a71c32]"
                        : "border-[#06254a]/15"
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="variant"
                      value={item.id}
                      checked={selected}
                      disabled={unavailable}
                      onChange={() => setVariant(item.id)}
                    />
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="aspect-square w-full object-cover"
                    />
                    <span className="block px-3 py-3">
                      <span className="block font-bold text-[#06254a]">
                        {item.name}
                      </span>
                      <span className="price-pulse mt-1 block text-2xl font-black tracking-tight text-[#a71c32]">
                        {item.price}
                      </span>
                      {unavailable ? (
                        <span className="mt-1 block text-xs font-bold text-[#a71c32]">
                          غير متوفر حاليًا
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </fieldset>
            <div className="inputBox">
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="اكتب اسمك"
                required
              />
              <span>الاسم</span>
            </div>
            <div className="inputBox">
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="06 00 00 00 00"
                required
              />
              <span>رقم الهاتف</span>
            </div>
            <div className="inputBox">
              <input
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="اكتب مدينتك"
                required
              />
              <span>المدينة</span>
            </div>
            <button
              className="group relative h-14 w-56 self-center rounded-2xl border border-[#06254a]/10 bg-white text-center text-xl font-semibold text-[#06254a] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#06254a] disabled:cursor-wait disabled:opacity-70"
              type="submit"
              disabled={isSubmitting || selectedUnavailable}
            >
              <div className="absolute top-[4px] left-1 z-10 flex h-12 w-1/4 items-center justify-center rounded-xl bg-[#a71c32] duration-500 group-hover:w-[216px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                  height="25"
                  width="25"
                  aria-hidden="true"
                >
                  <path
                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                    fill="#ffffff"
                  />
                  <path
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                    fill="#ffffff"
                  />
                </svg>
              </div>
              <p className="translate-x-2">
                {isSubmitting
                  ? "جارٍ الإرسال..."
                  : selectedUnavailable
                    ? "غير متاح حاليًا"
                    : "إرسال الطلب"}
              </p>
            </button>
            {error ? (
              <p className="text-center text-sm font-semibold text-[#a71c32]" role="alert">
                {error}
              </p>
            ) : null}
          </form>
      </div>
    </section>
  );
}
