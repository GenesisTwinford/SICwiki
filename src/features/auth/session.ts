import { headers } from "next/headers";
import { auth } from "@/features/auth/server";

export async function getAuthSession() {
  const requestHeaders = await headers();

  return auth.api.getSession({
    headers: new Headers(requestHeaders),
  });
}
