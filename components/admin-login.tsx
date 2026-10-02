"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "تعذر تسجيل الدخول.");
      }
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "تعذر تسجيل الدخول.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <section className="w-full max-w-md rounded-3xl border border-[#06254a]/10 bg-white p-7 shadow-xl sm:p-10">
        <p className="text-sm font-bold tracking-wide text-[#a71c32]">صحابي</p>
        <h1 className="mt-3 text-3xl font-black text-[#06254a]">إدارة الطلبات</h1>
        <p className="mt-2 text-sm leading-7 text-[#06254a]/65">
          أدخل كلمة مرور الإدارة لعرض الطلبات.
        </p>
        <form className="mt-7 space-y-5" onSubmit={onSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-bold text-[#06254a]"
              htmlFor="admin-password"
            >
              كلمة المرور
            </label>
            <input
              id="admin-password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#06254a]/15 bg-white px-4 py-3 text-start outline-none focus:border-[#a71c32] focus:ring-2 focus:ring-[#a71c32]/15"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="text-sm font-semibold text-[#a71c32]" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="w-full rounded-xl bg-[#06254a] px-5 py-3 font-bold text-white transition hover:bg-[#0a376d] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "جارٍ التحقق..." : "دخول"}
          </button>
        </form>
      </section>
    </main>
  );
}
