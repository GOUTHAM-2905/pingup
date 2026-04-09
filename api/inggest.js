import { serve } from "inngest/next";
import { inngest } from "../server/Inngest/index.js";
import { functions } from "../server/Inngest/index.js";
import connectDB from "../server/configs/db.js";

// connect DB before handling
await connectDB();

export default serve({
  client: inngest,
  functions,
});