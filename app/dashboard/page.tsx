import type { Metadata } from "next";
import Dashboard from "../../components/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  apiFetch,
  BackendError,
  type Category,
  type Course,
  type Instructor,
  type SubscriptionPlan,
  type BankTransferSettings,
  type LiveSession,
} from "../../lib/api";
import { SESSION_COOKIE } from "../../lib/session";

export const metadata: Metadata = {
  title: "لوحة الإدارة | أكاديمية كفاءات",
  robots: { index: false, follow: false },
};
export const instant = false;

export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");
  let data: [
    Course[],
    Category[],
    Instructor[],
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      isSubscribed: boolean;
      subscriptionEndsAt: string | null;
    }>,
    SubscriptionPlan[],
    BankTransferSettings,
    LiveSession[],
  ];
  try {
    data = await Promise.all([
      apiFetch<Course[]>("/admin/courses", {}, token),
      apiFetch<Category[]>("/categories"),
      apiFetch<Instructor[]>("/instructors"),
      apiFetch<
        Array<{
          id: string;
          name: string;
          email: string;
          role: string;
          isSubscribed: boolean;
          subscriptionEndsAt: string | null;
        }>
      >("/users", {}, token),
      apiFetch<SubscriptionPlan[]>("/admin/plans", {}, token),
      apiFetch<BankTransferSettings>("/admin/bank-transfer", {}, token),
      apiFetch<LiveSession[]>("/admin/live-sessions", {}, token),
    ]);
  } catch (error) {
    if (error instanceof BackendError && [401, 403].includes(error.status))
      redirect("/");
    throw error;
  }
  const [
    courses,
    categories,
    instructors,
    users,
    plans,
    bankTransfer,
    liveSessions,
  ] = data;
  return (
    <Dashboard
      courses={courses}
      categories={categories}
      instructors={instructors}
      users={users}
      plans={plans}
      bankTransfer={bankTransfer}
      liveSessions={liveSessions}
    />
  );
}
