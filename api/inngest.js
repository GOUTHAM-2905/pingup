import { serve } from "inngest/next";
import { inngest, functions } from "../Inngest/index.js";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});