import { Hono } from "hono";
import { auth } from "@/server/auth";

export const app = new Hono().basePath("/api");

// BetterAuthをここに接続
app.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// 他のAPI
app.get("/health", (c) => {
  return c.json({ ok: true });
});
