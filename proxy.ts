import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDevelopment = process.env.NODE_ENV === "development";
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""} https:;
    style-src-elem 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    style-src-attr 'unsafe-inline';
    img-src 'self' blob: data: https://images.unsplash.com https://*.bunnycdn.com https://*.mediadelivery.net;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://meet.kafaat-academy.com wss://meet.kafaat-academy.com https://video.bunnycdn.com https://*.bunnycdn.com;
    frame-src 'self' https://meet.kafaat-academy.com https://player.mediadelivery.net;
    media-src 'self' blob: https://*.bunnycdn.com https://*.mediadelivery.net;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
