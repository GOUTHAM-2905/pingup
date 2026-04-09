import { serve } from "inngest/express";
import { inngest } from "../server/inngest/index.js";
import { functions } from "../server/inngest/index.js";

// ✅ ADD HERE (top level)
console.log("INNGEST FUNCTION LOADED");

const handler = serve({
  client: inngest,
  functions,
});

export default handler;