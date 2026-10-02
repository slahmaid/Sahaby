import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/admin-auth";
import { updateStoreSettings } from "@/lib/google-sheets";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "@/lib/storefront-types";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Response.json({ error: "يرجى تسجيل الدخول مجددًا." }, { status: 401 });
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "الطلب غير مسموح." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات صفحة المتجر غير صالحة." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "بيانات صفحة المتجر غير صالحة." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const settings = {} as StoreSettings;
  for (const key of Object.keys(DEFAULT_STORE_SETTINGS) as (keyof StoreSettings)[]) {
    const value = data[key];
    const maxLength =
      key === "faqContent" || key === "reviewContent" ? 5000 : 500;
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      value.length > maxLength
    ) {
      return Response.json(
        { error: "يرجى تعبئة النصوص والتحقق من حدود طول الحقول." },
        { status: 400 },
      );
    }
    settings[key] = value.trim();
  }

  try {
    await updateStoreSettings(settings);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Unable to update storefront settings:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر حفظ إعدادات صفحة المتجر في Google Sheets.",
      },
      { status: 502 },
    );
  }
}
