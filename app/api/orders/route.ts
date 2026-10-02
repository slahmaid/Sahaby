import { appendOrder } from "@/lib/google-sheets";

export const runtime = "nodejs";

const sizes = new Set(["medium", "large"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const city = typeof data.city === "string" ? data.city.trim() : "";
  const size = typeof data.size === "string" ? data.size : "";

  if (
    name.length < 2 ||
    name.length > 100 ||
    phone.length < 6 ||
    phone.length > 30 ||
    city.length < 2 ||
    city.length > 100 ||
    !sizes.has(size)
  ) {
    return Response.json({ error: "يرجى التحقق من بيانات الطلب." }, { status: 400 });
  }

  try {
    const order = await appendOrder({ name, phone, city, size });
    return Response.json({ id: order.id }, { status: 201 });
  } catch (error) {
    console.error("Unable to save order to Google Sheets:", error);
    return Response.json(
      {
        error:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.message
            : "تعذر تسجيل طلبك الآن. يرجى المحاولة مرة أخرى بعد قليل.",
      },
      { status: 503 },
    );
  }
}
