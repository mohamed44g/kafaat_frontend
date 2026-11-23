import { cookies } from "next/headers";
import { SESSION_COOKIE } from "../lib/session";
import SiteHeaderClient from "./site-header-client";

export default async function SiteHeader() {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  return <SiteHeaderClient signedIn={signedIn} />;
}
