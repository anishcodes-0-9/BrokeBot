import { createApp } from "./app.js";
import { env } from "./config/env.js";
import "./db/connection.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`BrokeBot API running on http://localhost:${env.PORT}`);
});
