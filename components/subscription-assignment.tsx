"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { SubscriptionPlan } from "../lib/api";
import { secureFetch } from "../lib/client-fetch";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function SubscriptionAssignment({
  users,
  plans,
}: {
  users: UserOption[];
  plans: SubscriptionPlan[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setMessage("");
    startTransition(async () => {
      const response = await secureFetch("/api/backend/subscriptions/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(form.get("userId")),
          planId: String(form.get("planId")),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        setMessage(
          payload?.error?.message ??
            "تعذر إنشاء الاشتراك. هذه العملية تتطلب مديرًا عامًا.",
        );
        return;
      }
      formElement.reset();
      setMessage("تم تفعيل الباقة للمستخدم واحتساب تاريخ الانتهاء تلقائيًا.");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="m-6 grid gap-3 rounded-2xl border border-[#e4ede7] bg-[#f9fcfa] p-5 sm:grid-cols-2"
    >
      <h3 className="font-bold sm:col-span-2">تعيين باقة لمستخدم</h3>
      <select
        name="userId"
        required
        className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-3 text-sm"
      >
        <option value="">اختر المستخدم</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} — {user.email}
          </option>
        ))}
      </select>
      <select
        name="planId"
        required
        className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-3 text-sm"
      >
        <option value="">اختر الباقة</option>
        {plans
          .filter((plan) => plan.isActive)
          .map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} — {Number(plan.price).toLocaleString("ar-KW")} د.ك /
              شهريًا
            </option>
          ))}
      </select>
      <button
        disabled={pending || !users.length || !plans.length}
        className="rounded-xl bg-[#06cc8f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2"
      >
        {pending ? "جارٍ التفعيل..." : "تفعيل الاشتراك"}
      </button>
      {message && (
        <p role="status" className="text-sm sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
