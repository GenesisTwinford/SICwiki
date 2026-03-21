## /api
例えば、/api/usersにアクセスすると
jsonで{ "name": "Taro" }が返ってくる。

Honoでは
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello!' })
})

export default app

## BetterAuthの流れ
1. ユーザーがログイン→サーバーがDBにsession（ログイン情報）発行。
2. session_tokenをCookieに入れてブラウザに渡す。
3. 次回アクセスした時、ブラウザはサーバーにsession_tokenをCookieから自動で付与して送る。
