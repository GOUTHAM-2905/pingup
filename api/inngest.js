import { serve } from "inngest/express";
import { inngest } from "../server/inngest/index.js";
import { functions } from "../server/inngest/index.js";

// ✅ NO EXPRESS NEEDED
export default serve({
  client: inngest,
  functions,
});