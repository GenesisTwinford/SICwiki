// apiリクエストの交通案内をする。

import { Hono } from "hono";
import { auth } from "@/features/auth/server";

// URLに/apiを付す。
export const app = new Hono().basePath("/api");

// authが来たら、auth.handler()に渡す。
app.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
