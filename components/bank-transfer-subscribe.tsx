"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  BankTransferSettings,
  SubscriptionPlan,
} from "../lib/api";

export default function BankTransferSubscribe({
  plans,
  settings,
  initialPlan,
}: {
  plans: SubscriptionPlan[];
  settings: BankTransferSettings;
  initialPlan?: string;
}) {
  const [planSlug, setPlanSlug] = useState(
    plans.some((plan) => plan.slug === initialPlan)
      ? initialPlan!
      : (plans[0]?.slug ?? ""),
  );
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState("");
  const plan = plans.find((item) => item.slug === planSlug);
  const whatsappUrl = useMemo(() => {
    if (!plan || !settings.supportWhatsapp || !email.trim()) return "";
    const number = settings.supportWhatsapp.replace(/\D/g, "");
    const message = [
      "السلام عليكم، أرغب في تفعيل اشتراكي في منصة كفاءات.",
      `الباقة: ${plan.name}`,
      `السعر: ${Number(plan.price).toLocaleString("ar-KW")} د.ك شهريًا`,
      `البريد المسجل: ${email.trim()}`,
      "سأرفق صورة التحويل في هذه المحادثة.",
    ].join("\n");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }, [email, plan, settings.supportWhatsapp]);

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1500);
  }

  if (!settings.isActive) {
    return (
      <div className="rounded-2xl border border-[#e5ece7] bg-white p-8 text-center">
        <h2 className="text-xl font-bold">التحويل البنكي غير متاح حاليًا</h2>
        <p className="mt-3 text-sm text-[#838894]">
          تواصل مع الدعم أو حاول مرة أخرى لاحقًا.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-[#e5ece7] bg-white p-6">
        <h2 className="text-xl font-bold">1. اختر الباقة</h2>
        <div className="mt-5 space-y-3">
          {plans.map((item) => (
            <label
              key={item.id}
              className={`block cursor-pointer rounded-2xl border p-4 transition ${planSlug === item.slug ? "border-[#06cc8f] bg-[#f0fcf6]" : "border-[#e5ece7]"}`}
            >
              <input
                type="radio"
                name="plan"
                value={item.slug}
                checked={planSlug === item.slug}
                onChange={() => setPlanSlug(item.slug)}
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-[#838894]">
                    {item.description}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-[#06ad7a]">
                  {Number(item.price).toLocaleString("ar-KW")} د.ك / شهريًا
                </p>
              </div>
            </label>
          ))}
        </div>
        <label className="mt-6 grid gap-2 text-sm font-semibold">
          بريد حسابك في المنصة
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            dir="ltr"
            className="rounded-xl border border-[#dfe8e2] px-4 py-3 text-right outline-none focus:border-[#06cc8f]"
          />
        </label>
        <p className="mt-3 text-xs leading-6 text-[#838894]">
          استخدم نفس البريد الذي سجلت به حتى يستطيع الدعم تفعيل الاشتراك.
          ليس لديك حساب؟ <Link href="/register" className="font-bold text-[#06ad7a]">أنشئ حسابًا أولًا</Link>.
        </p>
      </section>

      <section className="rounded-2xl border border-[#e5ece7] bg-white p-6">
        <h2 className="text-xl font-bold">2. حوّل قيمة الاشتراك</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#737b78]">
          {settings.instructions}
        </p>
        <div className="mt-6 divide-y divide-[#edf0ee] rounded-2xl bg-[#f7faf8] px-5">
          <Detail label="البنك" value={settings.bankName} />
          <Detail label="اسم صاحب الحساب" value={settings.accountHolderName} />
          <Detail
            label="IBAN"
            value={settings.iban}
            action={() => copy(settings.iban, "iban")}
            copied={copied === "iban"}
          />
          {settings.accountNumber && (
            <Detail
              label="رقم الحساب"
              value={settings.accountNumber}
              action={() => copy(settings.accountNumber!, "account")}
              copied={copied === "account"}
            />
          )}
          {settings.swiftCode && (
            <Detail label="SWIFT" value={settings.swiftCode} />
          )}
        </div>
        <div className="mt-6 rounded-2xl border border-[#dcebe3] bg-[#f0fcf6] p-5">
          <h3 className="font-bold">3. أرسل صورة التحويل</h3>
          <p className="mt-2 text-sm leading-7 text-[#68736d]">
            اضغط الزر، ثم أرفق صورة إيصال التحويل في محادثة واتساب. سيراجع الدعم التحويل ويفعّل الباقة على حسابك.
          </p>
          <a
            href={whatsappUrl || undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!whatsappUrl}
            onClick={(event) => {
              if (!whatsappUrl) event.preventDefault();
            }}
            className={`mt-4 flex min-h-13 items-center justify-center rounded-full px-6 text-sm font-bold text-white ${whatsappUrl ? "bg-[#06cc8f] hover:bg-[#00b980]" : "cursor-not-allowed bg-[#9edfc7]"}`}
          >
            إرسال الإيصال إلى الدعم عبر واتساب
          </a>
          {!email.trim() && (
            <p className="mt-2 text-xs text-[#8b9490]">
              أدخل بريد حسابك أولًا لتجهيز رسالة الدعم.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  action,
  copied,
}: {
  label: string;
  value: string;
  action?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-xs text-[#8b9490]">{label}</p>
        <p className="mt-1 break-all text-sm font-bold" dir="auto">
          {value}
        </p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action}
          className="shrink-0 text-xs font-bold text-[#06ad7a]"
        >
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      )}
    </div>
  );
}
