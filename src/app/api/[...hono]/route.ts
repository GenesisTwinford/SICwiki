import { app } from "@/server/hono";

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
