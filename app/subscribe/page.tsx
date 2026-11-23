import type { Metadata } from "next";
import Link from "next/link";
import BankTransferSubscribe from "../../components/bank-transfer-subscribe";
import {
  getBankTransferSettings,
  getPlans,
  type BankTransferSettings,
} from "../../lib/api";

export const metadata: Metadata = {
  title: "الاشتراك والتحويل البنكي | أكاديمية كفاءات",
  description: "اختر باقة كفاءات وحوّل قيمة الاشتراك عبر الحساب البنكي.",
};
export const instant = false;

const unavailable: BankTransferSettings = {
  bankName: "",
  accountHolderName: "",
  iban: "",
  accountNumber: null,
  swiftCode: null,
  supportWhatsapp: "",
  instructions: "",
  isActive: false,
  updatedAt: "",
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const [{ plan }, plans, settings] = await Promise.all([
    searchParams,
    getPlans().catch(() => []),
    getBankTransferSettings().catch(() => unavailable),
  ]);
  return (
    <main className="flex-1 bg-[#f8fcf9] px-4 py-8 sm:px-5 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 text-sm text-[#838894]">
          <Link href="/" className="font-semibold text-[#06ad7a]">
            الرئيسية
          </Link>
          <span className="mx-2">/</span>
          الاشتراك
        </nav>
        <div className="mb-9 text-center">
          <h1 className="text-2xl font-bold text-[#21213f] sm:text-3xl">
            اشترك عن طريق التحويل البنكي
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#838894]">
            اختر الباقة، حوّل القيمة، ثم أرسل صورة الإيصال إلى الدعم لتفعيل
            اشتراكك.
          </p>
        </div>
        <BankTransferSubscribe
          plans={plans}
          settings={settings}
          initialPlan={plan}
        />
      </div>
    </main>
  );
}
