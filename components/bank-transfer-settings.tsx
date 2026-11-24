"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { BankTransferSettings } from "../lib/api";
import { secureFetch } from "../lib/client-fetch";

const fieldClass =
  "rounded-xl border border-[#dfe8e2] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#06cc8f]";

export default function BankTransferSettingsForm({
  settings,
}: {
  settings: BankTransferSettings;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");
    startTransition(async () => {
      const response = await secureFetch("/api/backend/admin/bank-transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: String(form.get("bankName") ?? "").trim(),
          accountHolderName: String(form.get("accountHolderName") ?? "").trim(),
          iban: String(form.get("iban") ?? "").trim(),
          accountNumber:
            String(form.get("accountNumber") ?? "").trim() || undefined,
          swiftCode: String(form.get("swiftCode") ?? "").trim() || undefined,
          supportWhatsapp: String(form.get("supportWhatsapp") ?? "").trim(),
          instructions: String(form.get("instructions") ?? "").trim(),
          isActive: form.get("isActive") === "on",
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        setMessage(body?.error?.message ?? "تعذر حفظ بيانات التحويل.");
        return;
      }
      setMessage("تم حفظ بيانات الحساب البنكي ورقم الدعم.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-semibold">
        اسم البنك
        <input
          name="bankName"
          required
          defaultValue={settings.bankName}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        اسم صاحب الحساب
        <input
          name="accountHolderName"
          required
          defaultValue={settings.accountHolderName}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        IBAN
        <input
          name="iban"
          required
          minLength={8}
          dir="ltr"
          defaultValue={settings.iban}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        رقم الحساب (اختياري)
        <input
          name="accountNumber"
          dir="ltr"
          defaultValue={settings.accountNumber ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        SWIFT (اختياري)
        <input
          name="swiftCode"
          dir="ltr"
          defaultValue={settings.swiftCode ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        رقم واتساب الدعم
        <input
          name="supportWhatsapp"
          required
          dir="ltr"
          placeholder="+96550000000"
          pattern="\+[1-9][0-9]{7,14}"
          defaultValue={settings.supportWhatsapp}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
        تعليمات التحويل
        <textarea
          name="instructions"
          required
          rows={4}
          defaultValue={settings.instructions}
          className={fieldClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={settings.isActive}
        />
        إظهار بيانات التحويل للعملاء
      </label>
      <button
        disabled={pending}
        className="rounded-xl bg-[#06cc8f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? "جارٍ الحفظ..." : "حفظ بيانات التحويل"}
      </button>
      {message && (
        <p role="status" className="text-sm sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
