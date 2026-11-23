"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDuration, type Course, type VideoLesson } from "../lib/api";

export default function CoursePlayer({
  course,
  lessons,
}: {
  course: Course;
  lessons: VideoLesson[];
}) {
  const [selected, setSelected] = useState(0);
  const current = lessons[selected];
  return (
    <main className="flex-1 bg-[#f8fcf9] pb-20">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-[#06ad7a] hover:underline"
        >
          العودة إلى تفاصيل الدورة ←
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#06ad7a]">
              {course.category.title}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-relaxed sm:text-3xl">
              {course.title}
            </h1>
          </div>
          <span className="text-sm text-[#838894]">
            {lessons.length} دروس · {formatDuration(course.totalTime)}
          </span>
        </div>
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section
            aria-labelledby="current-lesson"
            className="min-w-0 overflow-hidden rounded-[20px] border border-[#e2e9e4] bg-white"
          >
            <LessonPlayback key={current?.id ?? "empty"} lesson={current} />
            <div className="p-6">
              <p className="text-sm font-semibold text-[#06ad7a]">
                الدرس {selected + 1} من {lessons.length}
              </p>
              <h2 id="current-lesson" className="mt-2 text-xl font-bold">
                {current?.title}
              </h2>
              <p className="mt-3 leading-7 text-[#838894]">
                تابع الدرس، ثم اختر الدرس التالي من قائمة المحتوى.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={selected === 0}
                  onClick={() => setSelected(selected - 1)}
                  className="rounded-full border border-[#e1e7e3] px-6 py-3 text-sm font-bold disabled:opacity-40"
                >
                  الدرس السابق
                </button>
                <button
                  type="button"
                  disabled={selected === lessons.length - 1}
                  onClick={() => setSelected(selected + 1)}
                  className="rounded-full bg-[#06cc8f] px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  الدرس التالي
                </button>
              </div>
            </div>
          </section>
          <aside
            aria-label="دروس الدورة"
            className="overflow-hidden rounded-[20px] border border-[#e2e9e4] bg-white"
          >
            <div className="border-b border-[#edf0ee] p-5">
              <h2 className="text-lg font-bold">محتوى الدورة</h2>
              <p className="mt-1 text-sm text-[#838894]">
                اختر درسًا لبدء المشاهدة
              </p>
            </div>
            <ol>
              {lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-current={selected === index ? "true" : undefined}
                    className={`flex w-full items-center gap-3 border-b border-[#edf0ee] px-5 py-4 text-right transition last:border-0 ${selected === index ? "bg-[#e9faf2] text-[#00a875]" : "hover:bg-[#f8fcf9]"}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-6">
                      {lesson.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </main>
  );
}

function LessonPlayback({ lesson }: { lesson?: VideoLesson }) {
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(lesson));

  useEffect(() => {
    if (!lesson) return;
    let active = true;
    fetch(`/api/backend/videos/${lesson.id}/playback`)
      .then(async (response) => {
        const body = (await response.json()) as {
          data?: { url: string };
          error?: { message?: string };
        };
        if (!response.ok)
          throw new Error(body.error?.message ?? "تعذر تشغيل الفيديو حاليًا.");
        if (active) setPlaybackUrl(body.data?.url ?? "");
      })
      .catch((requestError: unknown) => {
        if (active)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "تعذر تشغيل الفيديو حاليًا.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lesson]);

  if (playbackUrl)
    return (
      <iframe
        src={playbackUrl}
        title={`فيديو ${lesson?.title ?? "الدورة"}`}
        className="aspect-video w-full border-0 bg-[#21213f]"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  return (
    <div className="flex aspect-video items-center justify-center bg-[#21213f] px-6 text-center text-sm text-white/80">
      {loading ? "جارٍ تجهيز المشغل..." : error || "لا يوجد فيديو متاح."}
    </div>
  );
}
