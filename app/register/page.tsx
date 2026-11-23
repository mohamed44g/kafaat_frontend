import type { Metadata } from "next";
import AuthForm from "../../components/auth-form";

export const metadata: Metadata = {
  title: "إنشاء حساب | أكاديمية كفاءات",
  description:
    "أنشئ حسابك في أكاديمية كفاءات وابدأ رحلة تطوير مهاراتك المهنية.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
