import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "../../../../lib/api";
import { SESSION_COOKIE } from "../../../../lib/session";
import { rejectInvalidCsrf } from "../../../../lib/request-security";

async function proxy(request: NextRequest, path: string[]) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const csrfError = rejectInvalidCsrf(request);
    if (csrfError) return csrfError;
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: { message: "يرجى تسجيل الدخول أولاً." } },
      { status: 401 },
    );
  const target = new URL(
    `${backendUrl}/${path.map(encodeURIComponent).join("/")}`,
  );
  request.nextUrl.searchParams.forEach((value, key) =>
    target.searchParams.append(key, value),
  );
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const response = await fetch(target, {
    method: request.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}

type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function POST(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function PUT(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
