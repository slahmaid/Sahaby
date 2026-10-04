import { connection } from "next/server";
import { FaqSection } from "@/components/faq-section";
import { MobileOrderBar } from "@/components/mobile-order-bar";
import { StickyFooter } from "@/components/ui/sticky-footer";
import { OrderForm } from "@/components/order-form";
import { ReviewsSection } from "@/components/reviews-section";
import { SiteHeader } from "@/components/site-header";
import { StatsSection } from "@/components/stats-section";
import { Hero10, type Hero10Props } from "@/components/ui/hero-10";
import { ParallaxScrollFeatureSection } from "@/components/ui/parallax-scroll-feature-section";
import {
  getStorefrontData,
  listOrders,
  type Order,
} from "@/lib/google-sheets";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  parseFaqContent,
  parseReviewContent,
} from "@/lib/storefront-types";

const heroImages = {
  images: [
    "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80",
  ],
  imageAlts: ["مصحف مفتوح", "خط قرآني", "مسجد"],
};

export default async function Home() {
  await connection();

  let products = DEFAULT_PRODUCTS;
  let settings = DEFAULT_STORE_SETTINGS;
  let orders: Order[] = [];
  try {
    const [storefront, storedOrders] = await Promise.all([
      getStorefrontData(),
      listOrders(),
    ]);
    ({ products, settings } = storefront);
    orders = storedOrders;
  } catch (error) {
    console.error("Unable to load storefront data; using defaults:", error);
  }
  const completedOrders = orders.filter((order) => order.status === "مكتمل");
  const citiesServed = new Set(completedOrders.map((order) => order.city)).size;
  const reviewItems = parseReviewContent(settings.reviewContent);
  const availableProducts = products.filter(
    (product) => product.active && product.stock !== 0,
  );
  const lowestPrice = availableProducts.length
    ? Math.min(...availableProducts.map((product) => product.price))
    : undefined;

  const hero = {
    title: settings.heroTitle,
    titleLine2Prefix: "مع",
    titleHighlight: settings.heroHighlight,
    description: settings.heroDescription,
    socialProof: settings.socialProof,
    offerNote:
      lowestPrice === undefined
        ? "المقاسات غير متاحة حاليًا"
        : `يبدأ السعر من ${lowestPrice} درهم · ${settings.shippingMessage}`,
    ...heroImages,
    animation: "none" as const,
  primaryCTA: {
    ctaEnabled: true,
    text: "اطلب الآن",
    link: "#order",
    variant: "default",
    size: "lg",
  },
  secondaryCTA: {
    ctaEnabled: true,
    text: "اكتشف المزايا",
    link: "#about",
    variant: "outline",
    size: "lg",
  },
  } satisfies Hero10Props;

  return (
    <>
      <SiteHeader />
      <main id="start" className="pt-16 pb-28 sm:pt-24 md:pb-0">
        <Hero10 {...hero} />
        <OrderForm products={products} settings={settings} />
        <ParallaxScrollFeatureSection
          deliveryDetails={`${settings.shippingMessage} · ${settings.deliveryEstimate}`}
        />
        <StatsSection
          citiesServed={citiesServed}
          completedOrders={completedOrders.length}
        />
        {reviewItems.length ? <ReviewsSection items={reviewItems} /> : null}
        <OrderForm id="order-bottom" products={products} settings={settings} />
        <FaqSection items={parseFaqContent(settings.faqContent)} />
      </main>
      <StickyFooter />
      <MobileOrderBar products={products} settings={settings} />
    </>
  );
}
