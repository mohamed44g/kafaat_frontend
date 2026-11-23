"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: "student" | "admin" | "super_admin";
}

interface SubscriptionData {
  isSubscribed: boolean;
  subscription: {
    status: string;
    startsAt: string;
    endAt: string;
    provider: string;
    plan: {
      name: string;
      price: string;
      currency: string;
      durationMonths: number;
      features: Array<{ id: string; label: string; featureKey: string }>;
    };
  } | null;
}

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#dedee6] bg-white px-4 py-3.5 text-sm text-[#21213f] outline-none transition placeholder:text-[#a4a7b2] focus:border-[#06cc8f] focus:ring-4 focus:ring-[#06cc8f]/10";
const countries = [
  ["+966", "السعودية"],
  ["+971", "الإمارات"],
  ["+965", "الكويت"],
  ["+974", "قطر"],
  ["+973", "البحرين"],
  ["+968", "عُمان"],
];

export default function Profile() {
  const router = useRouter();
  const [active, setActive] = useState<"details" | "subscription">("details");
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/backend/users/me"),
      fetch("/api/backend/subscriptions/me"),
    ])
      .then(async ([profileResponse, subscriptionResponse]) => {
        if (profileResponse.status === 401) {
          router.push("/login");
          return;
        }
        const profileBody = (await profileResponse.json()) as {
          data?: ProfileData;
          error?: { message?: string };
        };
        const subscriptionBody = (await subscriptionResponse.json()) as {
          data?: SubscriptionData;
        };
        if (!profileResponse.ok || !profileBody.data)
          throw new Error(
            profileBody.error?.message ?? "تعذر تحميل بيانات الحساب.",
          );
        setProfile(profileBody.data);
        setSubscription(subscriptionBody.data ?? null);
      })
      .catch((requestError: unknown) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "تعذر تحميل بيانات الحساب.",
        ),
      )
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError("");
    const form = new FormData(event.currentTarget);
    const countryCode = String(form.get("countryCode") ?? "");
    const phone = String(form.get("phone") ?? "").replace(/\D/g, "");
    const response = await fetch("/api/backend/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: `${countryCode}${phone}`,
      }),
    });
    const body = (await response.json()) as {
      data?: ProfileData;
      error?: { message?: string };
    };
    if (!response.ok || !body.data) {
      setError(body.error?.message ?? "تعذر حفظ البيانات.");
      return;
    }
    setProfile(body.data);
    setSaved(true);
  }

  const countryCode =
    countries.find(([code]) => profile?.phone.startsWith(code))?.[0] ?? "+966";
  const nationalPhone = profile?.phone.replace(countryCode, "") ?? "";
  const formatDate = (value?: string) =>
    value
      ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(
          new Date(value),
        )
      : "—";

  return (
    <main className="min-w-0 flex-1 overflow-x-hidden bg-[#f8fcf9] px-4 py-8 sm:px-5 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-9">
          <Link
            href="/"
            className="text-sm font-semibold text-[#06ad7a] hover:underline"
          >
            الرئيسية
          </Link>
          <span className="mx-2 text-[#a3a9a7]">/</span>
          <span className="text-sm text-[#838894]">الملف الشخصي</span>
          <h1 className="mt-5 text-3xl font-bold text-[#21213f]">
            الملف الشخصي
          </h1>
          <p className="mt-2 text-sm leading-7 text-[#838894]">
            إدارة معلوماتك الشخصية وتفاصيل اشتراكك في مكان واحد.
          </p>
        </div>
        <div className="grid items-start gap-6 md:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside className="rounded-[20px] border border-[#e5ece7] bg-white p-4">
            <div className="flex items-center gap-3 border-b border-[#edf0ee] px-2 pb-5 pt-2">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6faf1] text-[#06bb83]"
                aria-hidden="true"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
              </span>
              <div>
                <p className="font-bold">حسابي</p>
                <p className="mt-1 text-xs text-[#9295a3]">
                  إعدادات الملف الشخصي
                </p>
              </div>
            </div>
            <nav
              aria-label="أقسام الملف الشخصي"
              className="mt-4 grid grid-cols-2 gap-2 md:flex md:flex-col"
            >
              {(
                [
                  { id: "details", label: "تعديل المعلومات" },
                  { id: "subscription", label: "اشتراكي" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  aria-pressed={active === item.id}
                  className={`min-w-0 rounded-xl px-3 py-3 text-center text-sm font-semibold transition md:px-4 md:text-right ${active === item.id ? "bg-[#e7faf1] text-[#00a875]" : "text-[#717786] hover:bg-[#f7faf8]"}`}
                >
                  {item.label}
                </button>
              ))}
              {profile && ["admin", "super_admin"].includes(profile.role) && (
                <Link
                  href="/dashboard"
                  className="col-span-2 min-w-0 rounded-xl px-3 py-3 text-center text-sm font-semibold text-[#717786] transition hover:bg-[#f7faf8] hover:text-[#00a875] md:px-4 md:text-right"
                >
                  لوحة الإدارة
                </Link>
              )}
            </nav>
          </aside>
          <section className="min-w-0 rounded-[20px] border border-[#e5ece7] bg-white p-6 sm:p-8">
            {loading ? (
              <p className="py-12 text-center text-sm text-[#838894]">
                جارٍ تحميل بيانات الحساب...
              </p>
            ) : active === "details" ? (
              <>
                <div className="border-b border-[#edf0ee] pb-6">
                  <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
                  <p className="mt-2 text-sm text-[#838894]">
                    حدّث بياناتك الشخصية ومعلومات التواصل.
                  </p>
                </div>
                <form
                  onSubmit={handleSubmit}
                  onChange={() => setSaved(false)}
                  className="mt-7 space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">
                      الاسم الكامل
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        maxLength={150}
                        placeholder="أدخل اسمك الكامل"
                        defaultValue={profile?.name}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-sm font-semibold">
                      البريد الإلكتروني
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="example@email.com"
                        dir="ltr"
                        defaultValue={profile?.email}
                        className={`${fieldClass} text-right`}
                      />
                    </label>
                  </div>
                  <div className="max-w-sm">
                    <label
                      htmlFor="profile-phone"
                      className="block text-sm font-semibold"
                    >
                      رقم الجوال
                    </label>
                    <div
                      className="mt-2 flex overflow-hidden rounded-xl border border-[#dedee6] focus-within:border-[#06cc8f] focus-within:ring-4 focus-within:ring-[#06cc8f]/10"
                      dir="ltr"
                    >
                      <select
                        name="countryCode"
                        aria-label="مفتاح الدولة"
                        defaultValue={countryCode}
                        className="border-r border-[#dedee6] bg-[#f8faf9] px-3 text-sm outline-none"
                      >
                        {countries.map(([code, country]) => (
                          <option key={code} value={code}>
                            {country} {code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="profile-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel-national"
                        inputMode="tel"
                        required
                        pattern="[0-9٠-٩ +()-]{6,20}"
                        placeholder="رقم الجوال"
                        defaultValue={nationalPhone}
                        className="min-w-0 flex-1 px-4 py-3.5 text-right text-sm outline-none placeholder:text-[#a4a7b2]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 border-t border-[#edf0ee] pt-6">
                    <button
                      type="submit"
                      className="min-h-12 rounded-full bg-[#06cc8f] px-8 text-sm font-bold text-white transition hover:bg-[#00b980]"
                    >
                      حفظ التغييرات
                    </button>
                    {saved && (
                      <p role="status" className="text-sm text-[#717786]">
                        تم حفظ بياناتك بنجاح.
                      </p>
                    )}
                    {error && (
                      <p role="alert" className="text-sm text-red-700">
                        {error}
                      </p>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="border-b border-[#edf0ee] pb-6">
                  <h2 className="text-xl font-bold">اشتراكي</h2>
                  <p className="mt-2 text-sm text-[#838894]">
                    تابع حالة اشتراكك وتفاصيل خطتك.
                  </p>
                </div>
                <div className="mt-7 rounded-2xl border border-[#e5ece7] bg-[#f9fcfa] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#838894]">الخطة</p>
                      <h3 className="mt-2 text-lg font-bold">
                        {subscription?.subscription
                          ? subscription.subscription.plan.name
                          : "لا يوجد اشتراك"}
                      </h3>
                      {subscription?.subscription?.plan && (
                        <p className="mt-2 text-sm font-bold text-[#06ad7a]">
                          {Number(
                            subscription.subscription.plan.price,
                          ).toLocaleString("ar-KW")}{" "}
                          د.ك / شهريًا
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-[#e7faf1] px-4 py-2 text-xs font-bold text-[#00a875]">
                      {subscription?.isSubscribed ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <div className="mt-6 grid gap-5 border-t border-[#e5ece7] pt-6 sm:grid-cols-3">
                    {[
                      [
                        "تاريخ البداية",
                        formatDate(subscription?.subscription?.startsAt),
                      ],
                      [
                        "تاريخ الانتهاء",
                        formatDate(subscription?.subscription?.endAt),
                      ],
                      ["الحالة", subscription?.subscription?.status ?? "—"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-sm text-[#9295a3]">{label}</p>
                        <p className="mt-2 text-sm font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                  {!!subscription?.subscription?.plan.features.length && (
                    <ul className="mt-6 space-y-2 border-t border-[#e5ece7] pt-5">
                      {subscription.subscription.plan.features.map(
                        (feature) => (
                          <li
                            key={feature.id}
                            className="text-sm text-[#65716b]"
                          >
                            <span className="ml-2 font-bold text-[#06ad7a]">
                              ✓
                            </span>
                            {feature.label}
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
                <p className="mt-5 text-sm leading-7 text-[#838894]">
                  {subscription?.isSubscribed
                    ? subscription.subscription?.plan.features.some(
                        (feature) => feature.featureKey === "all_content",
                      )
                      ? "يمكنك مشاهدة جميع الدورات حتى تاريخ انتهاء اشتراكك."
                      : "اشتراكك نشط، وتُحدد صلاحياتك حسب مميزات الباقة."
                    : "اشترك للوصول إلى كامل محتوى الدورات."}
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
