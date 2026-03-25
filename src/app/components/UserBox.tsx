"use client";

import { authClient } from "@/features/auth/client";

export default function UserBox() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p className="text-sm text-slate-500">セッションを確認しています...</p>;
  }

  if (!session) {
    return <p className="text-sm text-slate-600">ログインすると学習状況を保存できます。</p>;
  }

  return (
    <p className="text-sm text-slate-700">
      {session.user.name || session.user.email} としてログイン中です。
    </p>
  );
}
