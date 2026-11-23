"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthNav from "./auth-nav";
import SearchInput from "./search-input";

const links = [
  ["/#categories", "الأقسام"],
  ["/#courses", "الدورات"],
  ["/live-sessions", "الجلسات المباشرة"],
  ["/learning-paths", "مسارات التعلم"],
  ["/#about", "عن الأكاديمية"],
] as const;

export default function SiteHeaderClient({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-5 lg:px-8">
        <Link
          href="/"
          aria-label="أكاديمية كفاءات - الرئيسية"
          className="shrink-0"
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
          className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold lg:flex xl:gap-7"
        >
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <form
          action="/#courses"
          method="get"
          role="search"
          className="hidden w-48 shrink-0 overflow-hidden rounded-full border border-gray-300 lg:flex xl:w-56"
        >
          <label htmlFor="course-search" className="sr-only">
            ابحث عن دورة أو مجال
          </label>
          <SearchInput />
          <button
            type="submit"
            className="bg-[#06cc8f] px-4 text-sm font-bold text-white transition hover:bg-[#00b980]"
          >
            ابحث
          </button>
        </form>
        <div className="mr-auto hidden shrink-0 items-center gap-1 sm:gap-3 lg:flex">
          <AuthNav signedIn={signedIn} />
          <Link
            href="/#courses"
            className="hidden rounded-full border border-gray-300 px-5 py-3 text-sm font-bold 2xl:inline-flex"
          >
            تصفح الدورات
          </Link>
        </div>
        <button
          type="button"
          aria-label="فتح القائمة"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="mr-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe8e2] text-[#21213f] lg:hidden"
        >
          <MenuIcon />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#17213d]/45"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="القائمة الرئيسية"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#edf0ee] pb-5">
              <Image
                src="/kafaat-logo.png"
                alt="كفاءات"
                width={1024}
                height={610}
                className="h-14 w-auto"
              />
              <button
                type="button"
                aria-label="إغلاق القائمة"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f7f4] text-xl text-[#21213f]"
              >
                ×
              </button>
            </div>
            <form
              action="/#courses"
              method="get"
              role="search"
              className="mt-6 flex overflow-hidden rounded-full border border-gray-300"
            >
              <label htmlFor="mobile-course-search" className="sr-only">
                ابحث عن دورة أو مجال
              </label>
              <input
                id="mobile-course-search"
                name="q"
                type="search"
                placeholder="ابحث عن دورة..."
                className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="bg-[#06cc8f] px-5 text-sm font-bold text-white"
              >
                ابحث
              </button>
            </form>
            <nav aria-label="روابط القائمة" className="mt-6 grid gap-2">
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3.5 font-semibold text-[#293047] transition hover:bg-[#eaf9f1] hover:text-[#009d70]"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t border-[#edf0ee] pt-4">
              <AuthNav signedIn={signedIn} />
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
