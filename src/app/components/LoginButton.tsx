"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <button
        disabled
        className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-500"
      >
        読み込み中...
      </button>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          onClick={() => router.push("/signin")}
        >
          ログイン
        </button>
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={() => router.push("/signup")}
        >
          新規登録
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-600">
        {session.user.name || session.user.email} さん
      </span>
      <button
        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
        }}
      >
        ログアウト
      </button>
    </div>
  );
}
