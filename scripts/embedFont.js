import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve paths relative to script location
const fontPath = resolve(__dirname, "../public/fonts/zhcn.woff");
const svgPath = resolve(__dirname, "../public/images/share-preview.svg");

// Read the font file
const fontFile = readFileSync(fontPath);
// Convert to base64
const base64Font = fontFile.toString("base64");

// Read the SVG template
let svgContent = readFileSync(svgPath, "utf-8");
// Replace the placeholder with the base64 font data
svgContent = svgContent.replace("{BASE64_FONT_DATA}", base64Font);

// Write the new SVG with embedded font
writeFileSync(svgPath, svgContent);

console.log("Font embedded successfully!");
