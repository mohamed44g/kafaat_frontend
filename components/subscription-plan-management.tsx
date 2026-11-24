"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { SubscriptionPlan } from "../lib/api";
import { secureFetch } from "../lib/client-fetch";

async function apiRequest(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  const response = await secureFetch(`/api/backend/${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  if (!response.ok)
    throw new Error(payload?.error?.message ?? "تعذرت العملية.");
}

const inputClass =
  "rounded-xl border border-[#dfe8e2] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#06cc8f]";

export default function SubscriptionPlanManagement({
  plans,
}: {
  plans: SubscriptionPlan[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      slug: String(form.get("slug") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      price: Number(form.get("price")),
      durationMonths: Number(form.get("durationMonths")),
      isActive: form.get("isActive") === "on",
    };
    run(async () => {
      await apiRequest(
        editing ? `admin/plans/${editing.id}` : "admin/plans",
        editing ? "PATCH" : "POST",
        payload,
      );
      setEditing(null);
      formElement.reset();
      setMessage("تم حفظ الباقة بنجاح.");
    });
  }

  function addFeature(event: FormEvent<HTMLFormElement>, planId: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    run(async () => {
      await apiRequest(`admin/plans/${planId}/features`, "POST", {
        featureKey: String(form.get("featureKey") ?? "").trim(),
        label: String(form.get("label") ?? "").trim(),
      });
      formElement.reset();
      setMessage("تمت إضافة الميزة إلى الباقة.");
    });
  }

  function removePlan(id: string) {
    if (
      !window.confirm("هل تريد حذف الباقة؟ لا يمكن حذف باقة مرتبطة باشتراكات.")
    )
      return;
    run(async () => {
      await apiRequest(`admin/plans/${id}`, "DELETE");
      setMessage("تم حذف الباقة.");
    });
  }

  function removeFeature(planId: string, featureId: string) {
    run(async () => {
      await apiRequest(`admin/plans/${planId}/features/${featureId}`, "DELETE");
      setMessage("تم حذف الميزة.");
    });
  }

  function run(work: () => Promise<void>) {
    setMessage("");
    startTransition(async () => {
      try {
        await work();
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذرت العملية.");
      }
    });
  }

  return (
    <div className="p-6">
      <form
        key={editing?.id ?? "new-plan"}
        onSubmit={savePlan}
        className="grid gap-3 rounded-2xl border border-[#e4ede7] bg-[#f9fcfa] p-5 sm:grid-cols-2"
      >
        <div className="flex items-center justify-between sm:col-span-2">
          <h3 className="font-bold">
            {editing ? "تعديل الباقة" : "إضافة باقة جديدة"}
          </h3>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-[#75817a]"
            >
              إلغاء
            </button>
          )}
        </div>
        <input
          name="name"
          required
          minLength={2}
          defaultValue={editing?.name}
          placeholder="اسم الباقة"
          className={inputClass}
        />
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          defaultValue={editing?.slug}
          placeholder="المعرف مثل basic"
          dir="ltr"
          className={inputClass}
        />
        <input
          name="price"
          type="number"
          min="0"
          step="0.001"
          required
          defaultValue={editing?.price}
          placeholder="السعر بالدينار الكويتي"
          className={inputClass}
        />
        <input
          name="durationMonths"
          type="number"
          min="1"
          max="36"
          required
          defaultValue={editing?.durationMonths ?? 1}
          placeholder="دورة التجديد بالشهور"
          className={inputClass}
        />
        <textarea
          name="description"
          required
          minLength={2}
          defaultValue={editing?.description}
          placeholder="وصف الباقة"
          rows={3}
          className={`${inputClass} sm:col-span-2`}
        />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={editing?.isActive ?? true}
          />
          الباقة متاحة للاشتراك
        </label>
        <button
          disabled={pending}
          className="rounded-xl bg-[#06cc8f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {pending ? "جارٍ الحفظ..." : "حفظ الباقة"}
        </button>
      </form>

      {message && (
        <p role="status" className="my-4 text-sm text-[#238d68]">
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl border border-[#e4ede7] bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${plan.isActive ? "bg-[#e8f8ef] text-[#0a9d70]" : "bg-gray-100 text-gray-500"}`}
                  >
                    {plan.isActive ? "نشطة" : "موقوفة"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#7b8581]">
                  {plan.description}
                </p>
              </div>
              <p className="shrink-0 text-xl font-bold text-[#06ad7a]">
                {Number(plan.price).toLocaleString("ar-KW")} د.ك
              </p>
            </div>
            <p className="mt-3 text-xs text-[#929c96]">
              {plan.durationMonths === 1
                ? "التجديد شهري"
                : `التجديد كل ${plan.durationMonths} شهور`}
            </p>
            <div className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between rounded-xl bg-[#f5faf7] px-3 py-2"
                >
                  <span className="text-sm">✓ {feature.label}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(plan.id, feature.id)}
                    disabled={pending}
                    className="text-xs font-semibold text-red-500"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
            <form
              onSubmit={(event) => addFeature(event, plan.id)}
              className="mt-4 grid gap-2 sm:grid-cols-2"
            >
              <input
                name="featureKey"
                required
                pattern="[a-z0-9]+(?:_[a-z0-9]+)*"
                placeholder="feature_key"
                dir="ltr"
                className={inputClass}
              />
              <input
                name="label"
                required
                minLength={2}
                placeholder="اسم الميزة الظاهر"
                className={inputClass}
              />
              <button
                disabled={pending}
                className="rounded-xl border border-[#06cc8f] px-4 py-2.5 text-sm font-bold text-[#00a875] sm:col-span-2"
              >
                إضافة ميزة
              </button>
            </form>
            <div className="mt-4 flex gap-3 border-t border-[#edf0ee] pt-4">
              <button
                type="button"
                onClick={() => setEditing(plan)}
                className="text-sm font-bold text-[#009d70]"
              >
                تعديل الباقة
              </button>
              <button
                type="button"
                onClick={() => removePlan(plan.id)}
                className="text-sm font-bold text-red-500"
              >
                حذف الباقة
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
