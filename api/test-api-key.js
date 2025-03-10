import OpenAI from "openai";
import { debug, debugError } from "../scripts/debug.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { key, provider } = req.body;

    if (!key || !provider) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (isDevelopment) {
      debug("Testing API key:", { provider });
    }

    let client;
    let modelName;

    // Configure the client based on the provider
    switch (provider) {
      case "deepseek":
        client = new OpenAI({
          baseURL: "https://api.deepseek.com",
          apiKey: key,
          defaultHeaders: { "api-key": key },
        });
        modelName = "deepseek-chat";
        break;
      case "perplexity":
        client = new OpenAI({
          baseURL: "https://api.perplexity.ai",
          apiKey: key,
        });
        modelName = "sonar";
        break;
      default:
        return res.status(400).json({ error: "Invalid provider" });
    }

    try {
      // Make a minimal test request to verify the API key
      const completion = await client.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Test" },
        ],
        model: modelName,
        max_tokens: 5, // Minimal tokens to reduce cost
      });

      // If we get here, the API key is valid
      res.status(200).json({ valid: true });
    } catch (apiError) {
      if (isDevelopment) {
        debugError("API request error:", apiError);
      }

      // Handle specific error types
      if (
        apiError.status === 401 ||
        apiError.status === 403 ||
        (apiError.message && apiError.message.toLowerCase().includes("api key"))
      ) {
        return res.status(401).json({
          error: "Invalid API key",
          message: apiError.message,
        });
      }

      throw apiError; // Re-throw for general error handler
    }
  } catch (error) {
    if (isDevelopment) {
      debugError("API key test error:", error);
    }

    res.status(500).json({
      error: "Failed to test API key",
      message: error.message || "Unknown error occurred",
    });
  }
}

export default handler;
