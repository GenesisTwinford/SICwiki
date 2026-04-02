"use client";

import { authClient } from "@/features/auth/client";

export default function UserBox() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p className="text-sm text-slate-500">セッション情報を確認しています...</p>;
  }

  if (!session) {
    return (
      <p className="text-sm leading-6 text-slate-600">
        ログインすると、学習の進み具合や公開プロフィールを自動で準備できます。
      </p>
    );
  }

  return (
    <p className="text-sm leading-6 text-slate-700">
      {session.user.name || session.user.email} としてログイン中です。
    </p>
  );
}
