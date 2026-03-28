// ブラウザからの受付窓口。/api以降のすべてのリクエストをHonoに丸投げする。

import { app } from "@/server/hono";

// このエンドポイント(https://...api...com)を一番近くのサーバーで軽く動かすための宣言(edge)。
export const runtime = "edge";

// GETやPOSTはHTTPメソッド（ブラウザからサーバーへのリクエスト）。
// 引数（関数に入れる数）の名前をreqとし、型をRequestとした。
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
