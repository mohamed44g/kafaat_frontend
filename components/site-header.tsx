import { Suspense } from "react";
import { cookies } from "next/headers";
import SearchInput from "./search-input";
import AuthNav from "./auth-nav";
import { SESSION_COOKIE } from "../lib/session";
import Link from "next/link";
import Image from "next/image";

export default async function SiteHeader() {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-4 px-4 py-3 sm:px-5 lg:flex-nowrap lg:px-8">
        <Link
          href="/"
          aria-label="أكاديمية كفاءات - الرئيسية"
          className="order-1 shrink-0"
        >
          <Image
            src="/kafaat-logo.png"
            alt="كفاءات"
            width={1024}
            height={610}
            priority
            className="h-14 w-auto"
          />
        </Link>
        <nav
          aria-label="التنقل الرئيسي"
          className="order-3 flex w-full flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs font-semibold sm:gap-x-6 sm:text-sm lg:order-2 lg:w-auto lg:flex-1 lg:flex-nowrap lg:border-0 lg:pt-0"
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
          className="order-4 flex w-full shrink-0 overflow-hidden rounded-full border border-gray-300 sm:w-72 lg:order-3 lg:w-48 xl:w-56"
        >
          <label htmlFor="course-search" className="sr-only">
            ابحث عن دورة أو مجال
          </label>
          <Suspense fallback={<SearchInputFallback />}>
            <SearchInput />
          </Suspense>
          <button
            type="submit"
            className="bg-[#06cc8f] px-4 text-sm font-bold text-white transition hover:bg-[#00b980]"
          >
            ابحث
          </button>
        </form>
        <div className="order-2 mr-auto flex shrink-0 items-center gap-1 sm:gap-3 lg:order-4">
          <AuthNav signedIn={signedIn} />
          <Link
            href="/#courses"
            className="hidden rounded-full border border-gray-300 px-5 py-3 text-sm font-bold 2xl:inline-flex"
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
