import type { Metadata } from "next";
import Profile from "../../components/profile";

export const metadata: Metadata = {
  title: "الملف الشخصي | أكاديمية كفاءات",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <Profile />;
}
