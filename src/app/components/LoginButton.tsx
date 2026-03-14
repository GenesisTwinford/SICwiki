"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return <button disabled>読み込み中...</button>;
  }

  // ログインしてない
  if (!session) {
    return (
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push("/signin")}
        >
          ログイン
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => router.push("/signup")}
        >
          新規登録
        </button>
      </div>
    );
  }

  // ログインしてる
  return (
    <div className="flex items-center gap-2">
      <span>こんにちは、{session.user.name || session.user.email}さん</span>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
