import { app } from "./app";
import { healthRoute } from "./routes/health";

app.route("/health", healthRoute);

export { app };