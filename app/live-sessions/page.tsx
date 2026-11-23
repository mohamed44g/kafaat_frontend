import type { Metadata } from "next";
import Link from "next/link";
import { getLiveSessions } from "../../lib/api";

export const metadata: Metadata = {
  title: "الجلسات المباشرة | أكاديمية كفاءات",
  description:
    "جلسات مباشرة مع خبراء أكاديمية كفاءات لمشتركي الباقة البريميوم.",
};
export const instant = false;

const labels = {
  scheduled: "قادمة",
  live: "مباشرة الآن",
  ended: "انتهت",
  canceled: "ملغاة",
  failed: "غير متاحة",
};

export default async function LiveSessionsPage() {
  const sessions = await getLiveSessions();
  return (
    <main className="flex-1 bg-[#f7fbf9] px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <span className="rounded-full bg-[#e5f8ef] px-4 py-2 text-sm font-bold text-[#00a875]">
            للباقة البريميوم
          </span>
          <h1 className="mt-6 text-4xl font-bold text-[#17213d]">
            الجلسات المباشرة
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#7c8782]">
            قابل الخبراء مباشرة، اطرح أسئلتك، وطبّق ما تعلمته داخل جلسات
            منظمة من أكاديمية كفاءات.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-[#e1e9e4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    session.status === "live"
                      ? "bg-red-50 text-red-600"
                      : "bg-[#e8f9f0] text-[#00a875]"
                  }`}
                >
                  {labels[session.status]}
                </span>
                <span className="text-xs text-[#89938e]">
                  {session.durationMinutes} دقيقة
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-[#20283e]">
                {session.title}
              </h2>
              {session.description && (
                <p className="mt-3 line-clamp-3 leading-7 text-[#7b8680]">
                  {session.description}
                </p>
              )}
              <p className="mt-5 text-sm font-semibold text-[#53615a]">
                {new Intl.DateTimeFormat("ar-KW", {
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(new Date(session.startsAt))}
              </p>
              <Link
                href={`/live-sessions/${session.id}`}
                className="mt-6 inline-flex w-full justify-center rounded-full bg-[#06cc8f] px-5 py-3 font-bold text-white transition hover:bg-[#00b980]"
              >
                دخول الجلسة
              </Link>
            </article>
          ))}
        </div>
        {!sessions.length && (
          <div className="mt-10 rounded-2xl border border-dashed border-[#cad7d0] bg-white p-12 text-center">
            <h2 className="text-xl font-bold text-[#20283e]">
              لا توجد جلسات مجدولة حاليًا
            </h2>
            <p className="mt-3 text-[#7b8680]">
              ستظهر المواعيد الجديدة هنا فور إضافتها من لوحة الإدارة.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

