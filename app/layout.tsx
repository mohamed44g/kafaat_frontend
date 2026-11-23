import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "أكاديمية كفاءات | تعلم مهارة تصنع مستقبلك",
  description:
    "أكاديمية كفاءات منصة للتدريب المهني في الخليج. تعلم المهارات العملية من خلال دورات مصورة وجلسات مباشرة مع الخبراء.",
  openGraph: {
    title: "أكاديمية كفاءات",
    description: "تعلم مهارة تصنع مستقبلك مع أكاديمية كفاءات",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col">
        <Suspense
          fallback={
            <div className="h-[113px] border-b border-gray-100 bg-white" />
          }
        >
          <SiteHeader />
        </Suspense>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
