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
      price: product?.price ?? 999,
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
    <section
      id={id}
      className="scroll-mt-24 bg-gradient-to-b from-white to-[#f7f4ed] px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-[#06254a]/[0.08] bg-white p-5 shadow-[0_20px_60px_rgba(6,37,74,0.09)] sm:p-8">
        <div className="text-center">
          <p className="text-xs font-black tracking-wide text-[#a71c32]">
            خطوة واحدة تفصلك
          </p>
          <h2 className="mt-2 mb-2 font-serif text-3xl font-bold text-[#06254a] sm:text-4xl">
            {settings.orderTitle}
          </h2>
          <p className="mx-auto mb-4 max-w-lg text-sm leading-6 text-[#06254a]/70">
            {settings.orderDescription}
          </p>
          <p className="mx-auto mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#a71c32]/15 bg-[#a71c32]/[0.06] px-4 py-2 text-sm font-bold text-[#a71c32]">
            <span className="size-2 rounded-full bg-[#a71c32]" />
            {settings.shippingMessage}
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <fieldset className="grid grid-cols-2 gap-3 sm:gap-4">
              <legend className="sr-only">المقاس</legend>
              {variants.map((item) => {
                const selected = variant === item.id;
                const unavailable = !item.active || item.outOfStock;
                const inputId = `${id}-variant-${item.id}`;
                return (
                  <label
                    key={item.id}
                    htmlFor={inputId}
                    className={`relative overflow-hidden rounded-xl border bg-white text-center transition-colors ${
                      unavailable ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                    } ${
                      selected
                        ? "border-[#a71c32] ring-2 ring-[#a71c32]/70"
                        : "border-[#06254a]/15 hover:border-[#06254a]/40"
                    }`}
                  >
                    <input
                      className="peer sr-only"
                      id={inputId}
                      type="radio"
                      name={`${id}-variant`}
                      value={item.id}
                      checked={selected}
                      disabled={unavailable}
                      onChange={() => setVariant(item.id)}
                    />
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover sm:aspect-square"
                    />
                    <span className="block px-2 py-3 sm:px-3">
                      <span className="block font-bold text-[#06254a]">
                        {item.name}
                      </span>
                      <span className="mt-1 block text-xl font-black tracking-tight text-[#a71c32] sm:text-2xl">
                        {item.price} درهم
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
            {selectedVariant ? (
              <div
                aria-live="polite"
                className="flex items-center justify-between gap-3 rounded-xl bg-[#06254a]/[0.04] px-4 py-3"
              >
                <span className="text-sm text-[#06254a]/70">
                  اختيارك:{" "}
                  <span className="font-bold text-[#06254a]">
                    {selectedVariant.name}
                  </span>
                </span>
                <span className="shrink-0 font-black text-[#a71c32]">
                  {selectedVariant.price} درهم
                </span>
              </div>
            ) : null}
            <div className="inputBox">
              <input
                id={`${id}-name`}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                placeholder="اكتب اسمك"
                required
              />
              <label htmlFor={`${id}-name`}>الاسم</label>
            </div>
            <div className="inputBox">
              <input
                id={`${id}-phone`}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                maxLength={30}
                placeholder="06 00 00 00 00"
                required
              />
              <label htmlFor={`${id}-phone`}>رقم الهاتف</label>
            </div>
            <div className="inputBox">
              <input
                id={`${id}-city`}
                name="city"
                type="text"
                autoComplete="address-level2"
                maxLength={100}
                placeholder="اكتب مدينتك"
                required
              />
              <label htmlFor={`${id}-city`}>المدينة</label>
            </div>
            <button
              className="min-h-14 w-full rounded-2xl bg-[#a71c32] px-5 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-[#8f172b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#06254a] disabled:cursor-wait disabled:opacity-70"
              type="submit"
              disabled={isSubmitting || selectedUnavailable}
            >
              {isSubmitting
                ? "جارٍ إرسال الطلب..."
                : selectedUnavailable
                  ? "غير متاح حاليًا"
                  : `أرسل الطلب · ${selectedVariant?.price ?? ""} درهم`}
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
