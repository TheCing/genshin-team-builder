import "./loadEnv.js"; // Load env vars first
import express from "express";
import cors from "cors";
import { handler as generateTeamHandler } from "../api/generate-team.js";
import { handler as chatHandler } from "../api/chat.js";
import { handler as testApiKeyHandler } from "../api/test-api-key.js";
import { debug } from "./debug.js";

const app = express();
const port = 3001;

// Debug environment variables
debug("Environment check:", {
  hasApiKey: !!process.env.DEEPSEEK_API_KEY,
  nodeEnv: process.env.NODE_ENV,
});

// Middleware
app.use(cors());
app.use(express.json());

app.post("/api/generate-team", async (req, res) => {
  await generateTeamHandler(req, res);
});

app.post("/api/chat", async (req, res) => {
  await chatHandler(req, res);
});

app.post("/api/test-api-key", async (req, res) => {
  await testApiKeyHandler(req, res);
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
  console.log("Available endpoints:");
  console.log("  - /api/generate-team");
  console.log("  - /api/chat");
  console.log("  - /api/test-api-key");
});
