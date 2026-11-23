import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import JitsiMeeting from "../../../components/jitsi-meeting";
import { SESSION_COOKIE } from "../../../lib/session";

export const metadata: Metadata = {
  title: "قاعة الجلسة المباشرة | أكاديمية كفاءات",
  robots: { index: false, follow: false },
};
export const instant = false;

export default async function LiveSessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const { id } = await params;
  if (!token) redirect(`/login?next=/live-sessions/${encodeURIComponent(id)}`);
  return <JitsiMeeting sessionId={id} />;
}

