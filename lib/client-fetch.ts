"use client";

import { CSRF_COOKIE } from "./session";

function readCookie(name: string): string | undefined {
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

export function secureFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = readCookie(CSRF_COOKIE);
    if (csrfToken) headers.set("X-CSRF-Token", decodeURIComponent(csrfToken));
  }
  return fetch(input, { ...init, headers, credentials: "same-origin" });
}
