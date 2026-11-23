import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import CoursePlayer from "../../../../components/course-player";
import { getCourse } from "../../../../lib/api";
import { SESSION_COOKIE } from "../../../../lib/session";

type Props = { params: Promise<{ slug: string }> };
export const instant = false;
export const metadata: Metadata = {
  title: "مشاهدة الدورة | أكاديمية كفاءات",
  robots: { index: false, follow: false },
};
export default async function WatchPage({ params }: Props) {
  if (!(await cookies()).has(SESSION_COOKIE)) redirect("/login");
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  return <CoursePlayer course={course} lessons={course.videos ?? []} />;
}
