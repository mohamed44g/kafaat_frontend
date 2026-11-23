"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDuration, type Category, type Course } from "../lib/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80";

function CourseGrid({ items }: { items: Course[] }) {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((course) => (
        <article
          key={course.id}
          className="overflow-hidden rounded-[20px] border border-[#dedee2] bg-white"
        >
          <Link
            href={`/courses/${course.slug}`}
            aria-label={`تفاصيل دورة ${course.title}`}
            className="block focus-visible:outline-2 focus-visible:outline-[#06cc8f]"
          >
            <div
              className="relative aspect-[1.12] bg-[#e6f7ef] bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0,191,132,.8), transparent 60%), url('${course.thumbnailUrl ?? fallbackImage}')`,
              }}
            >
              <span className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#06b77e]">
                {course.category.title}
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold">{course.title}</h3>
              <p className="mt-5 text-sm text-[#9295a3]">
                دورة تدريبية عملية{" "}
                <span className="float-left">
                  ◷ {formatDuration(course.totalTime)}
                </span>
              </p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}

const button =
  "inline-flex min-h-14 items-center justify-center rounded-full px-9 text-sm font-bold transition hover:opacity-85";

export default function CourseCatalog({
  query,
  categories,
  courses,
}: {
  query: string;
  categories: Category[];
  courses: Course[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const visibleCourses = courses.filter(
    (course) =>
      (!selectedCategory || course.categoryId === selectedCategory) &&
      (!query ||
        `${course.title} ${course.category.title}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  return (
    <>
      <section id="categories" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">الأقسام</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[{ id: "", title: "الكل" }, ...categories].map((category) => (
            <button
              type="button"
              key={category.id || "all"}
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
              className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${selectedCategory === category.id ? "border-[#06cc8f] bg-[#06cc8f] text-white" : "border-[#e1e2e7] hover:border-[#06cc8f] hover:text-[#06b77e]"}`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </section>
      <section id="courses" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">الدورات التدريبية</h2>
            <p className="mt-2 text-sm text-[#9295a3]">
              نماذج للمجالات التي يمكنك تعلمها على كفاءات
            </p>
          </div>
        </div>
        {visibleCourses.length ? (
          <CourseGrid items={visibleCourses} />
        ) : (
          <p className="rounded-2xl border border-gray-200 p-8 text-center text-[#777d8b]">
            لم نجد دورات مطابقة لبحثك.{" "}
            <Link href="/#courses" className="font-semibold text-[#06bd85]">
              عرض كل الدورات
            </Link>
          </p>
        )}
      </section>
      {!selectedCategory && !query && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <h2 className="mb-8 text-2xl font-bold">اكتشف مهارات جديدة</h2>
          <CourseGrid items={courses.slice(0, 3)} />
          <div className="mt-12 text-center">
            <a
              href="#categories"
              className={`${button} bg-[#06cc8f] text-white`}
            >
              المزيد من المجالات
            </a>
          </div>
        </section>
      )}
    </>
  );
}
