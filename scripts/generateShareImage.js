import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateShareImage(teamData, characters) {
  // Resolve paths
  const svgTemplatePath = resolve(
    __dirname,
    "../public/images/share-preview.svg"
  );
  const outputPath = resolve(__dirname, "../public/images/share-preview.png");

  // Read SVG template
  let svgContent = readFileSync(svgTemplatePath, "utf-8");

  // Create image elements for each character
  const characterImages = await Promise.all(
    teamData.members.map(async (charId, index) => {
      const character = characters.find((c) => c.id === charId);
      if (!character) return "";

      // Load and convert character image to base64
      const imagePath = resolve(
        __dirname,
        `../public/images/characters/${character.name.toLowerCase()}.png`
      );
      try {
        const imageBuffer = readFileSync(imagePath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString(
          "base64"
        )}`;

        const x = 200 + index * 220; // Match the slot positions
        return `
          <image
            x="${x}"
            y="250"
            width="160"
            height="160"
            href="${base64Image}"
            preserveAspectRatio="xMidYMid slice"
          />
        `;
      } catch (err) {
        console.error(`Error loading image for ${character.name}:`, err);
        return "";
      }
    })
  );

  // Insert character images before the closing </svg>
  svgContent = svgContent.replace(
    "</svg>",
    `${characterImages.join("")}</svg>`
  );

  // Create temporary SVG with embedded images
  const tempSvgPath = resolve(__dirname, "../public/images/temp-share.svg");
  writeFileSync(tempSvgPath, svgContent);

  try {
    // Convert to PNG
    await sharp(tempSvgPath).png().toFile(outputPath);

    // Clean up temporary file
    writeFileSync(tempSvgPath, ""); // Clear the temp file

    console.log("Share preview generated successfully!");
    return outputPath;
  } catch (err) {
    console.error("Error generating share image:", err);
    throw err;
  }
}

export default generateShareImage;
