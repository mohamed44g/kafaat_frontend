"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface JoinConfig {
  session: {
    id: string;
    title: string;
    startsAt: string;
    durationMinutes: number;
  };
  meetUrl: string;
  domain: string;
  roomName: string;
  jwt: string;
  userInfo: { displayName: string; email: string };
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code?: string; message?: string };
}

interface JitsiApi {
  dispose: () => void;
  addEventListener: (event: string, listener: () => void) => void;
}

interface JitsiOptions {
  roomName: string;
  width: string;
  height: string;
  parentNode: HTMLElement;
  jwt: string;
  lang: string;
  userInfo: { displayName: string; email: string };
  configOverwrite: Record<string, unknown>;
  interfaceConfigOverwrite: Record<string, unknown>;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: JitsiOptions,
    ) => JitsiApi;
  }
}

function loadJitsiScript(meetUrl: string): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  const source = `${meetUrl.replace(/\/$/, "")}/external_api.js`;
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${source}"]`,
  );
  if (existing)
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("تعذر تحميل واجهة الجلسة.")),
        { once: true },
      );
    });

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("تعذر تحميل واجهة الجلسة."));
    document.head.appendChild(script);
  });
}

export default function JitsiMeeting({ sessionId }: { sessionId: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<
    "loading" | "joining" | "joined" | "error"
  >("loading");
  const [error, setError] = useState("");
  const [requiresPremium, setRequiresPremium] = useState(false);

  useEffect(() => {
    let disposed = false;
    let api: JitsiApi | null = null;

    async function join() {
      try {
        const response = await fetch(
          `/api/backend/live-sessions/${encodeURIComponent(sessionId)}/join`,
          { cache: "no-store" },
        );
        const body = (await response
          .json()
          .catch(() => null)) as ApiEnvelope<JoinConfig> | null;
        if (!response.ok || !body?.success) {
          setRequiresPremium(
            response.status === 402 ||
              body?.error?.code === "SUBSCRIPTION_REQUIRED",
          );
          throw new Error(
            body?.error?.message || "تعذر تجهيز الجلسة المباشرة.",
          );
        }
        if (disposed || !rootRef.current) return;
        setState("joining");
        await loadJitsiScript(body.data.meetUrl);
        if (disposed || !rootRef.current || !window.JitsiMeetExternalAPI)
          return;
        api = new window.JitsiMeetExternalAPI(body.data.domain, {
          roomName: body.data.roomName,
          width: "100%",
          height: "100%",
          parentNode: rootRef.current,
          jwt: body.data.jwt,
          lang: "ar",
          userInfo: body.data.userInfo,
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
          },
        });
        api.addEventListener("videoConferenceJoined", () => {
          if (!disposed) setState("joined");
        });
        if (!disposed) setState("joined");
      } catch (caught) {
        if (!disposed) {
          setError(
            caught instanceof Error
              ? caught.message
              : "حدث خطأ أثناء الاتصال بالجلسة.",
          );
          setState("error");
        }
      }
    }

    void join();
    return () => {
      disposed = true;
      api?.dispose();
    };
  }, [sessionId]);

  return (
    <main className="flex-1 bg-[#f5faf7] px-4 py-6 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#06b87f]">جلسة مباشرة</p>
            <h1 className="mt-2 text-2xl font-bold text-[#17213d]">
              قاعة الجلسة داخل أكاديمية كفاءات
            </h1>
          </div>
          <Link
            href="/live-sessions"
            className="rounded-full border border-[#dfe7e2] bg-white px-5 py-2.5 text-sm font-bold"
          >
            العودة إلى الجلسات
          </Link>
        </div>

        <section className="relative min-h-[calc(100dvh-10rem)] overflow-hidden rounded-2xl border border-[#dfe7e2] bg-white shadow-sm sm:min-h-[620px] lg:min-h-[720px]">
          {state !== "joined" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white p-8 text-center">
              {state === "error" ? (
                <div className="max-w-lg">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                    !
                  </span>
                  <h2 className="mt-5 text-xl font-bold text-[#17213d]">
                    تعذر دخول الجلسة
                  </h2>
                  <p className="mt-3 leading-7 text-[#76817c]">{error}</p>
                  {requiresPremium && (
                    <Link
                      href="/subscribe"
                      className="mt-6 inline-flex rounded-full bg-[#06cc8f] px-7 py-3 font-bold text-white"
                    >
                      اشترك في الباقة البريميوم
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-4 border-[#dff5ec] border-t-[#06cc8f]" />
                  <h2 className="mt-5 text-lg font-bold text-[#17213d]">
                    {state === "loading"
                      ? "جارٍ التحقق من صلاحية الدخول..."
                      : "جارٍ الاتصال بقاعة الجلسة..."}
                  </h2>
                  <p className="mt-2 text-sm text-[#87918c]">
                    قد يطلب المتصفح السماح باستخدام الكاميرا والميكروفون.
                  </p>
                </div>
              )}
            </div>
          )}
          <div
            ref={rootRef}
            dir="ltr"
            className="h-[calc(100dvh-10rem)] w-full sm:h-[620px] lg:h-[720px]"
          />
        </section>
      </div>
    </main>
  );
}
