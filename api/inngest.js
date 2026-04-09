import { serve } from "inngest/vercel";
import { inngest, functions } from "../server/Inngest/index.js";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});