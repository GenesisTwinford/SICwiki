"use client";

import { authClient } from "@/lib/auth-client";

export default function UserBox() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <p>読み込み中...</p>;
  if (!session) return <p>未ログイン</p>;

  return <p>{session.user.name} としてログイン中</p>;
}
