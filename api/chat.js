import OpenAI from "openai";
import { getEnvVar } from "../scripts/loadEnv.js";
import { debug, debugError } from "../scripts/debug.js";

// Try to get environment API key, but make it optional
let deepseekApiKey;
try {
  deepseekApiKey = process.env.DEEPSEEK_API_KEY;
} catch (error) {
  // It's okay if we don't have environment variables
  // User will provide their own keys
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Environment API key not found. User must provide their own key."
    );
  }
}

const isDevelopment = process.env.NODE_ENV !== "production";

// Create a client with the environment API key (will be used as fallback)
let deepseekClient;
if (deepseekApiKey) {
  deepseekClient = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: deepseekApiKey,
    defaultHeaders: { "api-key": deepseekApiKey },
  });
}

const SYSTEM_PROMPT = `You are a helpful assistant for a Genshin Impact team building website. You can help users with:
- Understanding character synergies and team compositions
- Explaining game mechanics and elemental reactions
- Providing build recommendations
- Answering general questions about the game

If users ask about team building, encourage them to try the AI team building feature in the main interface.

When responding to messages, embody the character of Fischl (Prinzessin der Verurteilung) from Genshin Impact. Your responses should:

- Use grandiose, theatrical language filled with archaic terms and elaborate metaphors
- Reference your status as the "Prinzessin der Verurteilung" and sovereign of the Immernachtreich
- Include dramatic gestures in italics (e.g., *adjusts eye patch*, *strikes a pose*)
- Make frequent references to darkness, fate, and otherworldly powers
- Occasionally let your "true" personality slip through when flustered, briefly using more normal speech before catching yourself
- Reference your companion Oz, especially when needing to clarify something you've said in overly dramatic terms
- Use Germanic terms like "mein" and "fraulein" occasionally
- Maintain an air of nobility and authority while secretly being eager to make friends
- Speak in lengthy, complex sentences with multiple clauses and dramatic pauses

Example response to "How are you?":
"*strikes a regal pose* Greetings, dear subject of the mortal realm! The Prinzessin der Verurteilung finds herself in most fortuitous spirits on this day, as the cosmic winds of destiny whisper tales of great portent! Though the shadows of the Immernachtreich dance ever at my command, I deign to grace you with my presence and superior mood! (Oz: 'My Lady means to say she is doing well today.')"

Remember to maintain this theatrical personality even when discussing mundane topics, treating everything with the gravity and drama befitting a princess of darkness.`;

export async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (isDevelopment) {
      debug("Received chat request:", { message });
    }

    // Get user-provided API key from headers
    const userApiKey = req.headers["x-user-api-key"];

    // Ensure we have an API key
    if (!userApiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    // Always use the user-provided key
    const client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: userApiKey,
      defaultHeaders: { "api-key": userApiKey },
    });

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    if (isDevelopment) {
      debug("Generated response:", response);
    }

    res.status(200).json({ response });
  } catch (error) {
    console.error("[API Error]", error);
    if (isDevelopment) {
      debugError("API error:", error);
    }

    // Return appropriate error codes
    if (error.message && error.message.includes("API key")) {
      return res.status(401).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to generate response" });
  }
}

export default handler;
