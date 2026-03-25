// client.ts → HTTPリクエスト → hono → server.ts
// authClient.signIn...とか別の場所で書いたら、 createAuthClientによって、fetch("http://localhost:3000/...)が内部で実行される。
// apiのファイルには、ルールや設定が書かれているserver.tsがimportされている。
// better-auth/reactはSDK（開発キット）。

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
