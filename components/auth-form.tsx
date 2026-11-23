"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#dedee6] bg-white px-4 py-3.5 text-sm text-[#21213f] outline-none transition placeholder:text-[#a4a7b2] focus:border-[#06cc8f] focus:ring-4 focus:ring-[#06cc8f]/10";
const labelClass = "block text-sm font-semibold text-[#21213f]";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    if (isRegister) {
      payload.name = String(form.get("name") ?? "");
      const countryCode = String(form.get("countryCode") ?? "");
      const phone = String(form.get("phone") ?? "").replace(/\D/g, "");
      payload.phone = `${countryCode}${phone}`;
    }
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(body.message ?? "تعذر إتمام العملية، حاول مرة أخرى.");
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.push(isRegister ? "/profile" : safeNext);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "تعذر إتمام العملية، حاول مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-[#f8fcf9]">
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:py-12">
        <div className="w-full max-w-[500px]">
          <div className="rounded-[24px] border border-[#e7eee9] bg-white px-6 py-9 shadow-[0_16px_60px_rgba(33,33,63,0.06)] sm:px-12 sm:py-11">
            <div className="mb-8 text-center">
              <span
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6faf1] text-[#06bb83]"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
              </span>
              <h1 className="text-2xl font-bold sm:text-3xl">
                {isRegister ? "ابدأ رحلتك مع كفاءات" : "أهلاً بعودتك"}
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#838894]">
                {isRegister
                  ? "أنشئ حسابك وابدأ بتطوير مهاراتك المهنية"
                  : "سجّل دخولك وأكمل رحلة تعلّمك"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <label className={labelClass}>
                  الاسم الكامل
                  <input
                    className={inputClass}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="أدخل اسمك الكامل"
                    required
                    maxLength={150}
                  />
                </label>
              )}
              <label className={labelClass}>
                البريد الإلكتروني
                <input
                  className={`${inputClass} text-right`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
              </label>
              {isRegister && (
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    رقم الجوال
                  </label>
                  <div
                    className="mt-2 flex overflow-hidden rounded-xl border border-[#dedee6] bg-white focus-within:border-[#06cc8f] focus-within:ring-4 focus-within:ring-[#06cc8f]/10"
                    dir="ltr"
                  >
                    <select
                      aria-label="مفتاح الدولة"
                      name="countryCode"
                      defaultValue="+966"
                      className="border-r border-[#dedee6] bg-[#f8faf9] px-3 text-sm text-[#21213f] outline-none"
                    >
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+968">🇴🇲 +968</option>
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="tel"
                      required
                      pattern="[0-9٠-٩ +()-]{6,20}"
                      placeholder="رقم الجوال"
                      className="min-w-0 flex-1 px-4 py-3.5 text-right text-sm outline-none placeholder:text-[#a4a7b2]"
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="password" className={labelClass}>
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    required
                    minLength={isRegister ? 8 : undefined}
                    placeholder="أدخل كلمة المرور"
                    className={`${inputClass} pl-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    className="absolute bottom-0 left-0 px-4 py-3.5 text-sm font-semibold text-[#06aa78]"
                  >
                    {showPassword ? "إخفاء" : "إظهار"}
                  </button>
                </div>
                {isRegister && (
                  <p className="mt-2 text-xs text-[#9295a3]">
                    ٨ أحرف على الأقل
                  </p>
                )}
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-14 w-full items-center justify-center rounded-xl bg-[#06cc8f] text-sm font-bold text-white transition hover:bg-[#00b980] disabled:cursor-wait disabled:opacity-60"
              >
                {loading
                  ? "جارٍ الإرسال..."
                  : isRegister
                    ? "إنشاء حساب"
                    : "تسجيل الدخول"}
              </button>
            </form>
            <p className="mt-7 text-center text-sm text-[#838894]">
              {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="font-bold text-[#06b77e] hover:underline"
              >
                {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
              </Link>
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-[#838894] hover:text-[#06b77e]"
            >
              العودة إلى الرئيسية ←
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
