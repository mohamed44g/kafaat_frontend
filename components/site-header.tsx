import { Suspense } from "react";
import { cookies } from "next/headers";
import SearchInput from "./search-input";
import AuthNav from "./auth-nav";
import { SESSION_COOKIE } from "../lib/session";
import Link from "next/link";

export default async function SiteHeader() {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-5 gap-y-4 px-5 py-5 xl:flex-nowrap xl:px-8">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight text-[#06cc8f]"
        >
          كفاءات
        </Link>
        <nav
          aria-label="التنقل الرئيسي"
          className="order-last flex w-full flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold md:order-none md:w-auto xl:flex-nowrap xl:gap-7"
        >
          <Link href="/#categories">الأقسام</Link>
          <Link href="/#courses">الدورات</Link>
          <Link href="/live-sessions">الجلسات المباشرة</Link>
          <Link href="/learning-paths">مسارات التعلم</Link>
          <Link href="/#about">عن الأكاديمية</Link>
        </nav>
        <form
          action="/#courses"
          method="get"
          role="search"
          className="order-last flex w-full shrink-0 overflow-hidden rounded-full border border-gray-300 md:order-none md:w-52 xl:w-60"
        >
          <label htmlFor="course-search" className="sr-only">
            ابحث عن دورة أو مجال
          </label>
          <Suspense fallback={<SearchInputFallback />}>
            <SearchInput />
          </Suspense>
          <button
            type="submit"
            className="bg-[#06cc8f] px-5 text-sm font-bold text-white transition hover:bg-[#00b980]"
          >
            ابحث
          </button>
        </form>
        <div className="flex shrink-0 items-center gap-3">
          <AuthNav signedIn={signedIn} />
          <Link
            href="/#courses"
            className="hidden rounded-full border border-gray-300 px-6 py-3 text-sm font-bold sm:inline-flex"
          >
            تصفح الدورات
          </Link>
        </div>
      </div>
    </header>
  );
}

function SearchInputFallback() {
  return (
    <input
      id="course-search"
      name="q"
      type="search"
      placeholder="ابحث عن دورة..."
      className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
    />
  );
}
