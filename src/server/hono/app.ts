import { Hono } from "hono";
import { auth } from "@/features/auth/server";

export const app = new Hono().basePath("/api");

app.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
