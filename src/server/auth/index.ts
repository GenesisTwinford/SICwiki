// 認証システム本体（サーバー）

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db";

export const auth = betterAuth({
  appName: "SICwiki",

  // 本番URLを明示
  baseURL: process.env.BETTER_AUTH_URL,

  // BetterAuthが待ち受けるURLの道
  basePath: "/api/auth",

  // このサイトから来たリクエストだけを信頼する
  trustedOrigins: ["http://localhost:3000", process.env.BETTER_AUTH_URL!],

  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // 開発用（本番では true 推奨）
  },

  // セッション設定
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7日間
    updateAge: 60 * 60 * 24, // 1日ごとに更新
  },

  // ソーシャルログイン
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Next.js の Server Action などで cookie をちゃんと扱いやすくする
  plugins: [nextCookies()],
});
