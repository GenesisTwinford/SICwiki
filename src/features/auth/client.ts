// client.ts → HTTPリクエスト → route.ts → hono/app.ts ← import server.ts
// authClient.signIn...とか別の場所で書いたら、 createAuthClientによって、fetch("baseURL/api...)が内部で実行される。
// apiのファイルには、serever.ts（ルールや設定が記載）がimportされている。
// better-auth/reactはSDK（開発キット）。

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
