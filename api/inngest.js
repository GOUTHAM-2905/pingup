import express from "express";
import { serve } from "inngest/express";
import { inngest } from "../server/inngest/index.js";
import { functions } from "../server/inngest/index.js";

const app = express();

app.use(express.json());

// ✅ IMPORTANT: use "/api/inngest"
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

export default app;