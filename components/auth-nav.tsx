"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { secureFetch } from "../lib/client-fetch";

export default function AuthNav({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  if (!signedIn)
    return (
      <Link
        href="/login"
        className="rounded-full px-4 py-3 text-sm font-bold transition hover:text-[#06cc8f]"
      >
        تسجيل دخول
      </Link>
    );
  return (
    <>
      <Link
        href="/profile"
        className="rounded-full px-3 py-3 text-sm font-bold transition hover:text-[#06cc8f]"
      >
        حسابي
      </Link>
      <button
        type="button"
        onClick={async () => {
          await secureFetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        }}
        className="rounded-full px-3 py-3 text-sm font-bold transition hover:text-[#06cc8f]"
      >
        خروج
      </button>
    </>
  );
}
