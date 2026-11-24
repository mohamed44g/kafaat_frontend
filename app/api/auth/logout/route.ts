import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "../../../../lib/api";
import { CSRF_COOKIE, SESSION_COOKIE } from "../../../../lib/session";
import { rejectInvalidCsrf } from "../../../../lib/request-security";

export async function POST(request: NextRequest) {
  const csrfError = rejectInvalidCsrf(request);
  if (csrfError) return csrfError;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await apiFetch("/auth/logout", { method: "POST" }, token);
    } catch {
      // Local cookies are still cleared when the backend is temporarily down.
    }
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(CSRF_COOKIE);
  return NextResponse.json({ success: true });
}
