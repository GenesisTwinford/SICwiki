// 1. /routes/health.ts：本体処理
// 2. /index.ts：/healthを付け、機能としてアクセス可能にする。 ←今ココ
// 3. /app.ts：/apiもつける。

import { app } from "./app";
import { healthRoute } from "./routes/health";

app.route("/health", healthRoute);

export { app };
