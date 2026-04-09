import { serve } from "inngest/next";
import { inngest } from "../server/Inngest/index.js";
import { functions } from "../server/Inngest/index.js";

console.log("KEY:", process.env.INNGEST_SIGNING_KEY); // 👈 ADD HERE

export default serve({
  client: inngest,
  functions,
});