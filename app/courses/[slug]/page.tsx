import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, formatDuration, getCourse } from "../../../lib/api";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug).catch(() => null);
  return course
    ? {
        title: `${course.title} | أكاديمية كفاءات`,
        description: `تعرّف على محتوى دورة ${course.title} واستكشف المهارات المهنية مع أكاديمية كفاءات.`,
      }
    : {};
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const lessons = course.videos ?? [];
  const preview = lessons.find(
    (lesson) => lesson.isFree && lesson.streamStatus === "ready",
  );
  const previewPlayback = preview
    ? await apiFetch<{ url: string; expires: number }>(
        `/videos/${preview.id}/playback`,
      ).catch(() => null)
    : null;
  const duration = formatDuration(course.totalTime);

  return (
    <main className="flex-1 bg-[#f8fcf9] pb-20">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <nav
          aria-label="مسار الصفحة"
          className="mb-8 flex flex-wrap gap-2 text-sm text-[#838894]"
        >
          <Link href="/">الرئيسية</Link>
          <span>/</span>
          <Link href="/#courses">الدورات</Link>
          <span>/</span>
          <span className="text-[#06ad7a]">{course.title}</span>
        </nav>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <span className="inline-flex rounded-full bg-[#e1f9ed] px-4 py-2 text-sm font-semibold text-[#06ad7a]">
              {course.category.title}
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-[1.5] text-[#21213f] sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-5 leading-8 text-[#777d8b]">
              {course.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[#555b6b]">
              <span className="rounded-full border border-[#e1e7e3] bg-white px-5 py-3">
                ◷ {duration}
              </span>
              <span className="rounded-full border border-[#e1e7e3] bg-white px-5 py-3">
                ▤ {course.totalVideo} دروس
              </span>
              <span className="rounded-full border border-[#e1e7e3] bg-white px-5 py-3">
                {preview ? "درس مجاني" : "ضمن الاشتراك"}
              </span>
            </div>
            <Link
              href="/subscribe"
              className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-[#06cc8f] px-9 text-sm font-bold text-white transition hover:bg-[#00b980]"
            >
              اشترك الآن
            </Link>
            <Link
              href={`/courses/${course.slug}/watch`}
              className="mr-5 inline-block text-sm font-semibold text-[#06ad7a] hover:underline"
            >
              مشترك بالفعل؟ شاهد الدورة
            </Link>
          </div>
          <div className="overflow-hidden rounded-[22px] border border-[#e2e9e4] bg-white shadow-[0_14px_45px_rgba(33,33,63,0.06)]">
            {previewPlayback ? (
              <iframe
                id="preview"
                src={previewPlayback.url}
                title={`فيديو مجاني: ${preview?.title}`}
                className="aspect-video w-full border-0 bg-[#21213f]"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[#21213f] px-6 text-center text-sm text-white/75">
                سيظهر الفيديو المجاني هنا بعد اكتمال رفعه ومعالجته.
              </div>
            )}
          </div>
        </div>
        <section id="course-content" className="mt-16 sm:mt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">محتوى الدورة</h2>
              <p className="mt-2 text-sm text-[#838894]">
                نظرة على الدروس والموضوعات التي تتناولها الدورة
              </p>
            </div>
            <p className="text-sm text-[#838894]">
              {lessons.length} دروس · {duration}
            </p>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[#e2e9e4] bg-white">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 border-b border-[#edf0ee] px-5 py-5 last:border-0 sm:px-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9faf2] text-sm font-bold text-[#06ad7a]">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="mt-1 text-xs text-[#9295a3]">
                    {lesson.isFree ? "مجاني" : "ضمن الاشتراك"}
                  </p>
                </div>
                {lesson.isFree && previewPlayback ? (
                  <a
                    href="#preview"
                    className="text-sm font-semibold text-[#06b77e]"
                  >
                    مجاني
                  </a>
                ) : (
                  <span className="text-xs text-[#9295a3]">للمشتركين</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
