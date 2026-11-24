import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE } from "./session";

function expectedOrigin(request: NextRequest): string {
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    request.nextUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    request.nextUrl.host;
  return `${protocol}://${host}`;
}

export function rejectUntrustedOrigin(
  request: NextRequest,
): NextResponse | null {
  const origin = request.headers.get("origin");
  if (origin === expectedOrigin(request)) return null;
  return NextResponse.json({ message: "الطلب غير موثوق." }, { status: 403 });
}

export function rejectInvalidCsrf(request: NextRequest): NextResponse | null {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value ?? "";
  const headerToken = request.headers.get("x-csrf-token") ?? "";
  const left = Buffer.from(cookieToken);
  const right = Buffer.from(headerToken);
  if (
    left.length > 0 &&
    left.length === right.length &&
    timingSafeEqual(left, right)
  )
    return null;
  return NextResponse.json(
    { message: "رمز حماية الطلب غير صالح." },
    { status: 403 },
  );
}
