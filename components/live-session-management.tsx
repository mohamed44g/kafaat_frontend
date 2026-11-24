"use client";

import { useState } from "react";
import type { LiveSession } from "../lib/api";
import { secureFetch } from "../lib/client-fetch";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { message?: string };
}

interface SessionForm {
  title: string;
  description: string;
  startsAt: string;
  durationMinutes: string;
}

const emptyForm: SessionForm = {
  title: "",
  description: "",
  startsAt: "",
  durationMinutes: "60",
};

const statusLabel: Record<LiveSession["status"], string> = {
  scheduled: "مجدولة",
  live: "مباشرة الآن",
  ended: "انتهت",
  canceled: "ملغاة",
  failed: "فشلت",
};

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await secureFetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const body = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success)
    throw new Error(body?.error?.message || "تعذر تنفيذ العملية.");
  return body.data;
}

export default function LiveSessionManagement({
  initialSessions,
}: {
  initialSessions: LiveSession[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
      };
      const session = await request<LiveSession>(
        editingId
          ? `/api/backend/admin/live-sessions/${editingId}`
          : "/api/backend/admin/live-sessions",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      setSessions((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? session : item))
          : [session, ...current],
      );
      setForm(emptyForm);
      setEditingId(null);
      setMessage(
        editingId ? "تم تحديث الجلسة." : "تم إنشاء جلسة مباشرة بنجاح.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع.");
    } finally {
      setBusy(false);
    }
  }

  function edit(session: LiveSession) {
    setEditingId(session.id);
    setForm({
      title: session.title,
      description: session.description ?? "",
      startsAt: toLocalDateTime(session.startsAt),
      durationMinutes: String(session.durationMinutes),
    });
    setMessage("");
  }

  async function remove(id: string) {
    if (!window.confirm("هل تريد حذف الجلسة المباشرة؟")) return;
    setBusy(true);
    setMessage("");
    try {
      await request<{ deleted: true }>(
        `/api/backend/admin/live-sessions/${id}`,
        {
          method: "DELETE",
        },
      );
      setSessions((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setMessage("تم حذف الجلسة.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حذف الجلسة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-[#edf0ee] p-6">
      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-semibold text-[#30394b]">
          عنوان الجلسة
          <input
            required
            minLength={2}
            maxLength={180}
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-[#dfe7e2] px-4 py-3 outline-none focus:border-[#06cc8f]"
          />
        </label>
        <label className="text-sm font-semibold text-[#30394b]">
          الموعد
          <input
            required
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) =>
              setForm({ ...form, startsAt: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-[#dfe7e2] px-4 py-3 outline-none focus:border-[#06cc8f]"
          />
        </label>
        <label className="text-sm font-semibold text-[#30394b]">
          المدة بالدقائق
          <input
            required
            type="number"
            min={15}
            max={1440}
            value={form.durationMinutes}
            onChange={(event) =>
              setForm({ ...form, durationMinutes: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-[#dfe7e2] px-4 py-3 outline-none focus:border-[#06cc8f]"
          />
        </label>
        <label className="text-sm font-semibold text-[#30394b] lg:col-span-2">
          الوصف
          <textarea
            rows={3}
            maxLength={5000}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="mt-2 w-full resize-none rounded-xl border border-[#dfe7e2] px-4 py-3 outline-none focus:border-[#06cc8f]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
          <button
            disabled={busy}
            className="rounded-xl bg-[#06cc8f] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "إنشاء جلسة مباشرة"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-xl border border-[#dfe7e2] px-6 py-3 text-sm font-bold"
            >
              إلغاء التعديل
            </button>
          )}
          {message && <p className="text-sm text-[#66736d]">{message}</p>}
        </div>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-[#edf0ee]">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="bg-[#f9fbfa] text-xs text-[#8a9690]">
            <tr>
              <th className="px-5 py-4">الجلسة</th>
              <th className="px-5 py-4">الموعد</th>
              <th className="px-5 py-4">المدة</th>
              <th className="px-5 py-4">الحالة</th>
              <th className="px-5 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-[#edf0ee]">
                <td className="px-5 py-4 font-bold text-[#252b3d]">
                  {session.title}
                </td>
                <td className="px-5 py-4 text-[#657069]">
                  {new Intl.DateTimeFormat("ar-KW", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(session.startsAt))}
                </td>
                <td className="px-5 py-4">{session.durationMinutes} دقيقة</td>
                <td className="px-5 py-4">{statusLabel[session.status]}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {!["ended", "canceled"].includes(session.status) && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            window.open(
                              `/live-sessions/${session.id}`,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="rounded-lg bg-[#e8f9f0] px-3 py-2 font-bold text-[#00a875]"
                        >
                          بدء كمضيف
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => edit(session)}
                          className="rounded-lg border border-[#dfe7e2] px-3 py-2 font-bold"
                        >
                          تعديل
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(session.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 font-bold text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!sessions.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[#8a9690]"
                >
                  لم تُضف جلسات مباشرة بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
