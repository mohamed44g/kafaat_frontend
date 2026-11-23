import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[#21213f] px-5 py-16 text-center text-sm text-[#a2a3b6]">
      <nav
        aria-label="روابط التذييل"
        className="flex flex-wrap justify-center gap-x-10 gap-y-4"
      >
        <Link href="/">الرئيسية</Link>
        <Link href="/#categories">الأقسام</Link>
        <Link href="/#courses">الدورات</Link>
        <Link href="/#about">عن الأكاديمية</Link>
      </nav>
      <p className="mt-14">© 2026 أكاديمية كفاءات. جميع الحقوق محفوظة.</p>
    </footer>
  );
}
