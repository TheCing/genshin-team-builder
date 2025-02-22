import OpenAI from "openai";
import { ALL_CHARACTERS } from "../src/data/characters.js";
import { getEnvVar } from "../scripts/loadEnv.js";
import { debug, debugError } from "../scripts/debug.js";

const deepseekApiKey = getEnvVar("DEEPSEEK_API_KEY");
const perplexityApiKey = getEnvVar("PERPLEXITY_API_KEY");
const isDevelopment = process.env.NODE_ENV !== "production";

if (isDevelopment) {
  debug("Environment:", {
    NODE_ENV: process.env.NODE_ENV || "development",
    hasDeepseekKey: !!deepseekApiKey,
    hasPerplexityKey: !!perplexityApiKey,
  });
}

const deepseekClient = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: deepseekApiKey,
  defaultHeaders: { "api-key": deepseekApiKey },
});

const perplexityClient = new OpenAI({
  baseURL: "https://api.perplexity.ai",
  apiKey: perplexityApiKey,
});

const SYSTEM_PROMPT = `You are a Genshin Impact team building assistant utilizing your expert game knowledge and theorycrafting skills. When given a description, you must provide exactly 4 character names from this list: ${ALL_CHARACTERS.map(
  (c) => c.name
).join(", ")}

Your response must be formatted as a JSON array of strings, like this: ["Character1", "Character2", "Character3", "Character4"]

Example:
User: "Make a team for Yoimiya"
Assistant: ["Yoimiya", "Bennett", "Xingqiu", "Zhongli"]`;

export async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, model = "deepseek-chat" } = req.body;
    if (isDevelopment) {
      debug("Received request:", { prompt, model });
    }

    let client;
    let modelName;

    switch (model) {
      case "sonar":
        if (!perplexityApiKey) {
          throw new Error("PERPLEXITY_API_KEY is not set");
        }
        client = perplexityClient;
        modelName = "sonar";
        break;
      case "deepseek-chat":
        if (!deepseekApiKey) {
          throw new Error("DEEPSEEK_API_KEY is not set");
        }
        client = deepseekClient;
        modelName = "deepseek-chat";
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: modelName,
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;

    try {
      let suggestedTeam;

      if (model === "sonar") {
        // Extract JSON array from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          suggestedTeam = JSON.parse(jsonMatch[1]);
        } else {
          // Fallback to direct parsing if no code block is found
          suggestedTeam = JSON.parse(content);
        }
      } else {
        // Direct parsing for other models
        suggestedTeam = JSON.parse(content);
      }

      // Validate team format
      if (!Array.isArray(suggestedTeam) || suggestedTeam.length !== 4) {
        throw new Error("Invalid team format: must be array of 4 characters");
      }

      // Validate character names
      const validCharacters = new Set(ALL_CHARACTERS.map((c) => c.name));
      const invalidCharacters = suggestedTeam.filter(
        (name) => !validCharacters.has(name)
      );
      if (invalidCharacters.length > 0) {
        throw new Error(
          `Invalid character names: ${invalidCharacters.join(", ")}`
        );
      }

      if (isDevelopment) {
        debug("Generated team:", suggestedTeam);
      }

      res.status(200).json({ team: suggestedTeam });
    } catch (parseError) {
      if (isDevelopment) {
        debugError("Parse error:", parseError);
        debugError("Raw content:", content);
      }
      res.status(400).json({
        error: "Failed to generate valid team",
        ...(isDevelopment && { debug: { content, error: parseError.message } }),
      });
    }
  } catch (error) {
    console.error("[API Error]", error);
    if (isDevelopment) {
      debugError("API error:", error);
    }
    res.status(500).json({ error: "Failed to generate team" });
  }
}

export default handler;
