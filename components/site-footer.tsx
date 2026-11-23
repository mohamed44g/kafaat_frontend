import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="bg-[#21213f] px-5 py-12 text-center text-sm text-[#a2a3b6] sm:py-16">
      <Link
        href="/"
        aria-label="أكاديمية كفاءات - الرئيسية"
        className="inline-flex"
      >
        <Image
          src="/kafaat-logo.png"
          alt="كفاءات"
          width={1024}
          height={610}
          className="h-20 w-auto brightness-0 invert"
        />
      </Link>
      <nav
        aria-label="روابط التذييل"
        className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-4 sm:gap-x-10"
      >
        <Link href="/">الرئيسية</Link>
        <Link href="/#categories">الأقسام</Link>
        <Link href="/#courses">الدورات</Link>
        <Link href="/#about">عن الأكاديمية</Link>
      </nav>
      <p className="mt-10 sm:mt-14">
        © 2026 أكاديمية كفاءات. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
