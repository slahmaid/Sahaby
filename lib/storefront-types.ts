export const PRODUCT_IDS = ["medium", "large"] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export type StoreProduct = {
  id: ProductId;
  name: string;
  price: number;
  stock: number | null;
  active: boolean;
};

export type StoreSettings = {
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  socialProof: string;
  orderTitle: string;
  orderDescription: string;
  shippingMessage: string;
  deliveryEstimate: string;
  faqContent: string;
  reviewContent: string;
};

export type StorefrontData = {
  products: StoreProduct[];
  settings: StoreSettings;
};

export const DEFAULT_PRODUCTS: StoreProduct[] = [
  { id: "medium", name: "متوسط", price: 999, stock: null, active: true },
  { id: "large", name: "كبير", price: 999, stock: null, active: true },
];

export const LEGACY_SAMPLE_REVIEW_CONTENT = [
  "أمين العلوي|قارئ من الرباط|الخط واضح والصفحة مريحة. صرت أقرأ كل يوم دون أن أتعب عيني.",
  "سارة بنجلون|قارئة من الدار البيضاء|المقاس المتوسط يناسب الحقيبة، ووصلني في مدينتي دون تكلفة توصيل.",
  "يوسف الإدريسي|قارئ من فاس|طلبت المقاس الكبير للبيت. الطباعة نظيفة، والقراءة أصبحت أهدأ.",
].join("\n");

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  heroTitle: "اقرأ بتمهّل",
  heroHighlight: "نور واضح",
  heroDescription:
    "مصحف رقمي هادئ للقراءة اليومية والتدبّر، بخط مريح وصفحات قريبة من اليد.",
  socialProof: "للقراءة في كل وقت",
  orderTitle: "اطلب الآن",
  orderDescription:
    "اكتب اسمك ورقم هاتفك ومدينتك، ونعود إليك لتأكيد الطلب.",
  shippingMessage: "توصيل مجاني",
  deliveryEstimate: "التوصيل خلال 48 ساعة أو أقل",
  faqContent: [
    "ما الفرق بين المتوسط والكبير؟|المتوسط أخف للحمل والتنقّل. الكبير أوضح للقراءة في البيت. يمكنك اختيار المقاس من نموذج الطلب.",
    "هل التوصيل مجاني؟|نعم. التوصيل مجاني إلى مدينتك، ولا نضيف تكلفة على ثمن المصحف.",
    "كيف أؤكد طلبي؟|اكتب اسمك ورقم هاتفك ومدينتك، ثم أرسل الطلب. نتواصل معك لتأكيد المقاس وموعد الوصول.",
    "كم يستغرق الوصول؟|بعد تأكيد الطلب نحدّد موعد التوصيل حسب المدينة، ونتصل بك قبل الوصول.",
    "هل يمكن تغيير المقاس بعد الطلب؟|نعم، أخبرنا قبل تأكيد التوصيل وسنبدّل المقاس لك.",
  ].join("\n"),
  reviewContent: "",
};

export function parseFaqContent(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([question, answer]) => Boolean(question && answer))
    .slice(0, 12)
    .map(([question, answer]) => ({ question, answer }));
}

export function parseReviewContent(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([name, role, quote]) => Boolean(name && role && quote))
    .slice(0, 12)
    .map(([name, role, quote]) => ({ name, role, quote }));
}
