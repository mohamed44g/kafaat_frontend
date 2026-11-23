import type { Metadata } from "next";
import AuthForm from "../../components/auth-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول | أكاديمية كفاءات",
  description: "سجّل دخولك إلى حسابك في أكاديمية كفاءات.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
