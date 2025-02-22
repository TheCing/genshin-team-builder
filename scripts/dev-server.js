import "./loadEnv.js"; // Load env vars first
import express from "express";
import { handler as generateTeamHandler } from "../api/generate-team.js";
import { debug } from "./debug.js";

const app = express();
const port = 3001;

// Debug environment variables
debug("Environment check:", {
  hasApiKey: !!process.env.DEEPSEEK_API_KEY,
  nodeEnv: process.env.NODE_ENV,
});

app.use(express.json());

app.post("/api/generate-team", async (req, res) => {
  await generateTeamHandler(req, res);
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
