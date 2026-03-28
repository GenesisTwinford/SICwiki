### BetterAuth の流れ
1. ユーザーがログイン
   - 画面のボタンや遷移：`app/components/LoginButton.tsx`
   - 認証用のリクエストを送るクライアント側： `features/auth/client.ts`

2. サーバーが DB に session（ログイン情報）を発行
   - Better Auth の設定本体： `features/auth/server.ts`
   - DB 接続： `server/db/index.ts`
   - `session` テーブル定義： `server/db/schema.ts`

3. `session_token` を Cookie に入れてブラウザに返す
   - Cookie を扱う Better Auth 設定：`features/auth/server.ts`
   - `/api/auth/*` を受ける Hono 側：`server/hono/app.ts`
   - Next.js から Hono へつなぐ入口：`app/api/[...hono]/route.ts`

4. 次回アクセスした時、ブラウザはサーバーに `session_token` を Cookie から自動で付けて送る
   - Cookie を読んで session を取り出す： `features/auth/session.ts`

### API の流れ（/features/auth）
`features/auth/client.ts` → HTTPリクエスト → `app/api/[...hono]/route.ts` → `hono/app.ts` ← import `server.ts`

1. authClient.signIn...とか書く："use client" が書かれているフロントのファイル

2. createAuthClientによって、fetch("baseURL/api...)が内部で実行される。：`features/auth/client.ts`

3. APIのファイルには、`auth/server.ts`（ログインルールや設定が記載）がimportされている。：`app/api/[...hono]/route.ts`及び`server/hono/app.ts`
※better-auth/reactはSDK（開発キット）。

### Hono の流れ（/server/hono）
1. /routes/health.ts：本体処理
2. /index.ts：/healthを付け、機能としてアクセス可能にする。
3. /app.ts：/apiもつける。



### /api
例えば、/api/usersにアクセスすると
jsonで{ "name": "Taro" }が返ってくる。

Honoでは
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello!' })
})

export default app

### 非同期処理
asyncを書いたら、その中にあるawaitの処理が終わるまで次の処理をしない。

### [...hono]/route.ts
ブラウザからの受付窓口。/api以降のすべてのリクエストをHonoに丸投げする。

import { app } from "@/server/hono";

このエンドポイント(https://...api...com)を一番近くのサーバーで軽く動かすための宣言(edge)。
export const runtime = "edge";

GETやPOSTはHTTPメソッド（ブラウザからサーバーへのリクエスト）。
引数（関数に入れる数）の名前をreqとし、型をRequestとした。
// GET：情報取得
export async function GET(req: Request) {
  // app.fetchで受け取ったリクエストをappに丸投げする。
  return app.fetch(req);
}
// POST：新規作成
export async function POST(req: Request) {
  return app.fetch(req);
}
// PUT：上書き、置換
export async function PUT(req: Request) {
  return app.fetch(req);
}
// PATCH：部分更新
export async function PATCH(req: Request) {
  return app.fetch(req);
}
export async function DELETE(req: Request) {
  return app.fetch(req);
}
