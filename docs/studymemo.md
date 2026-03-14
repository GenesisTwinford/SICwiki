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