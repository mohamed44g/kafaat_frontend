import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiFetch, BackendError } from "../../../../lib/api";
import { SESSION_COOKIE } from "../../../../lib/session";

interface AuthSession {
  accessToken: string;
  expiresIn: number;
  user: { id: string; name: string; email: string; role: string };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (action !== "login" && action !== "register")
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const session = await apiFetch<AuthSession>(`/auth/${action}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.accessToken, {
      httpOnly: true,
      sameSite: "lax",
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
