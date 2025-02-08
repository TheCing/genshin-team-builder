import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve paths relative to script location
const svgPath = resolve(__dirname, "../public/images/share-preview.svg");
const pngPath = resolve(__dirname, "../public/images/share-preview.png");

// Convert SVG to PNG
sharp(svgPath)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log("PNG created successfully!");
  })
  .catch((err) => {
    console.error("Error converting to PNG:", err);
  });
