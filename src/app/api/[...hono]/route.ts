// ブラウザからの受付窓口。/api以降のすべてのリクエストをHonoに丸投げする。

import { app } from "@/server/hono";

// このエンドポイント(https://...api...com)を一番近くのサーバーで軽く動かすための宣言(edge)。
export const runtime = "edge";

export async function GET(req: Request) {
  return app.fetch(req);
}
export async function POST(req: Request) {
  return app.fetch(req);
}
export async function PUT(req: Request) {
  return app.fetch(req);
}
export async function PATCH(req: Request) {
  return app.fetch(req);
}
export async function DELETE(req: Request) {
  return app.fetch(req);
}
