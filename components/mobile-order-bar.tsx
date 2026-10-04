"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  type StoreProduct,
  type StoreSettings,
} from "@/lib/storefront-types";

export function MobileOrderBar({
  products = DEFAULT_PRODUCTS,
  settings = DEFAULT_STORE_SETTINGS,
}: {
  products?: StoreProduct[];
  settings?: StoreSettings;
}) {
  const [hidden, setHidden] = useState(false);
  const availableProducts = products.filter(
    (product) => product.active && product.stock !== 0,
  );
  const lowestPrice = availableProducts.length
    ? Math.min(...availableProducts.map((product) => product.price))
    : undefined;

  useEffect(() => {
    const targets = document.querySelectorAll("#order, #order-bottom, footer");
    if (!targets.length) return;
    const visibleTargets = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        }
        setHidden(visibleTargets.size > 0);
      },
      { threshold: 0.05 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-30 transition-transform duration-300 md:hidden ${
        hidden ? "pointer-events-none translate-y-[150%]" : ""
      }`}
    >
      <div
        className="flex items-center justify-between gap-3 rounded-2xl border border-[#06254a]/10 bg-white/80 px-3 py-2.5 shadow-[0_10px_30px_rgba(6,37,74,0.12)] backdrop-blur-xl"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="min-w-0">
          <p className="text-xs text-[#06254a]/60">{settings.shippingMessage}</p>
          <p className="text-lg font-black leading-none text-[#a71c32]">
            {lowestPrice === undefined
              ? "غير متوفر"
              : `ابتداءً من ${lowestPrice} درهم`}
          </p>
        </div>
        {lowestPrice === undefined ? (
          <span className="shrink-0 rounded-xl bg-[#06254a]/10 px-5 py-3 text-sm font-bold text-[#06254a]/50">
            نفد المخزون
          </span>
        ) : (
          <a
            href="#order"
            className="shrink-0 rounded-xl bg-[#a71c32] px-5 py-3 text-sm font-bold text-white"
          >
            اطلب الآن
          </a>
        )}
      </div>
    </div>
  );
}
