import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiFetch, BackendError } from "../../../../lib/api";
import { CSRF_COOKIE, SESSION_COOKIE } from "../../../../lib/session";
import { rejectUntrustedOrigin } from "../../../../lib/request-security";

interface AuthSession {
  accessToken?: string;
  expiresIn?: number;
  user?: { id: string; name: string; email: string; role: string };
  mfaRequired?: boolean;
  mfaSetupRequired?: boolean;
  challengeToken?: string;
  setupSecret?: string;
  otpauthUri?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;
  const { action } = await params;
  if (action !== "login" && action !== "register" && action !== "mfa-verify")
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const backendAction = action === "mfa-verify" ? "mfa/verify" : action;
    const session = await apiFetch<AuthSession>(`/auth/${backendAction}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!session.accessToken || !session.expiresIn)
      return NextResponse.json(session);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expiresIn,
    });
    cookieStore.set(CSRF_COOKIE, randomBytes(32).toString("base64url"), {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expiresIn,
    });
    return NextResponse.json({ user: session.user });
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 502;
    const message =
      error instanceof BackendError
        ? error.message
        : "تعذر الاتصال بالخدمة، حاول مرة أخرى.";
    return NextResponse.json({ message }, { status });
  }
}
