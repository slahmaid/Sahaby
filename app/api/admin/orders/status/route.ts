import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/admin-auth";
import {
  updateOrderStatus,
} from "@/lib/google-sheets";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    return Response.json({ error: "بيانات التحديث غير صالحة." }, { status: 400 });
  }

  const id =
    body && typeof body === "object" && "id" in body && typeof body.id === "string"
      ? body.id
      : "";
  const status =
    body && typeof body === "object" && "status" in body &&
    typeof body.status === "string"
      ? body.status
      : "";

  if (!id || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return Response.json({ error: "بيانات التحديث غير صالحة." }, { status: 400 });
  }

  try {
    await updateOrderStatus(id, status as OrderStatus);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Unable to update order in Google Sheets:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر تحديث الطلب في Google Sheets.",
      },
      { status: 502 },
    );
  }
}
