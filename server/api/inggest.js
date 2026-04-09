import { serve } from "inngest/next";
import { inngest } from "../Inngest/index.js";
import { functions } from "../Inngest/index.js";

export default serve({
  client: inngest,
  functions,
});