import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";
import fetch from "node-fetch";

export async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { teamName, members } = req.body;
    console.log("Received team data:", { teamName, members });

    // Read the SVG template
    const svgTemplate = readFileSync(
      join(process.cwd(), "public", "images", "share-preview.svg"),
      "utf-8"
    );

    // Replace team name placeholder
    let svgContent = svgTemplate.replace("{teamName}", teamName || "");

    // Create image elements for each character
    const characterImages = await Promise.all(
      members.map(async (charName, index) => {
        try {
          const imageUrl = `https://rerollcdn.com/GENSHIN/Characters/1/${charName}.png`;
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${imageUrl}`);

          const imageBuffer = await response.buffer();
          const base64Image = `data:image/png;base64,${imageBuffer.toString(
            "base64"
          )}`;

          const x =
            index < 2
              ? 200 + index * 180 // First two slots
              : 200 + index * 180; // Last two slots (no extra gap)
          return `
            <image
              x="${x}"
              y="250"
              width="160"
              height="160"
              href="${base64Image}"
              preserveAspectRatio="xMidYMid slice"
              class="character-slot"
            />
          `;
        } catch (err) {
          console.error(`Error loading image for ${charName}:`, err);
          return "";
        }
      })
    );

    // Insert character images
    svgContent = svgContent.replace(
      "</svg>",
      `${characterImages.join("")}</svg>`
    );

    // Convert to PNG
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(join(process.cwd(), "public", "images", "share-preview.png"));

    console.log("PNG file written successfully");

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error generating share image:", error);
    res.status(500).json({ error: "Failed to generate share image" });
  }
}

// For Vercel deployment
export default handler;
