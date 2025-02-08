import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the font file
const fontPath = resolve(__dirname, "../public/fonts/zhcn.woff");
const fontFile = readFileSync(fontPath);
const base64Font = fontFile.toString("base64");

// Create the SVG template with embedded font
const svgTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @font-face {
                font-family: 'GenshinFont';
                src: url('data:application/x-font-woff;base64,${base64Font}') format('woff');
                font-weight: normal;
                font-style: normal;
            }
            text {
                font-family: 'GenshinFont', 'Segoe UI', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif;
                font-weight: 500;
            }
            .character-slot {
                clip-path: inset(0 0 0 0 round 8px);
            }
        </style>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#1e2642;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#141b33;stop-opacity:1" />
        </linearGradient>
        <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>

    <!-- Background with particles -->
    <rect width="1200" height="630" fill="url(#bgGradient)" />
    <circle cx="100" cy="100" r="1" fill="#ffffff" opacity="0.3" />
    <circle cx="300" cy="200" r="1" fill="#ffffff" opacity="0.3" />
    <circle cx="900" cy="150" r="1" fill="#ffffff" opacity="0.3" />
    <circle cx="1100" cy="300" r="1" fill="#ffffff" opacity="0.3" />
    <circle cx="200" cy="500" r="1" fill="#ffffff" opacity="0.3" />
    <circle cx="800" cy="450" r="1" fill="#ffffff" opacity="0.3" />

    <!-- Header Area -->
    <g transform="translate(60, 60)">
        <circle cx="30" cy="30" r="30" fill="#ffffff" opacity="0.1" />
        <text x="80" y="45" fill="#ffffff" font-size="32">Team Composition</text>
        <text x="380" y="45" fill="#ffffff" font-size="32" opacity="0.7">|</text>
        <text x="420" y="45" fill="#ffffff" font-size="32">{teamName}</text>
        <!-- Star Rating -->
        <g transform="translate(1000, 30)" filter="url(#starGlow)">
            <path d="M0,-10 L2,-3 L9,-3 L4,1 L6,8 L0,4 L-6,8 L-4,1 L-9,-3 L-2,-3 Z" 
                fill="#ffffff" transform="translate(0, 0)" />
            <path d="M0,-10 L2,-3 L9,-3 L4,1 L6,8 L0,4 L-6,8 L-4,1 L-9,-3 L-2,-3 Z" 
                fill="#ffffff" transform="translate(25, 0)" />
            <path d="M0,-10 L2,-3 L9,-3 L4,1 L6,8 L0,4 L-6,8 L-4,1 L-9,-3 L-2,-3 Z" 
                fill="#ffffff" transform="translate(50, 0)" />
        </g>
    </g>

    <!-- Character Slots -->
    <g transform="translate(200, 250)">
        <!-- Slots -->
        <g class="character-slot">
            <rect x="0" y="0" width="160" height="160" rx="8"
                fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        </g>
        <g class="character-slot">
            <rect x="180" y="0" width="160" height="160" rx="8"
                fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        </g>
        <g class="character-slot">
            <rect x="360" y="0" width="160" height="160" rx="8"
                fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        </g>
        <g class="character-slot">
            <rect x="540" y="0" width="160" height="160" rx="8"
                fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        </g>
    </g>

    <!-- Footer -->
    <g transform="translate(600, 550)" text-anchor="middle">
        <text fill="rgba(255,255,255,0.5)" font-size="20">
            genshin-team-builder.vercel.app
        </text>
    </g>
</svg>`;

// Save the template
const outputPath = resolve(__dirname, "../public/images/share-preview.svg");
writeFileSync(outputPath, svgTemplate);

console.log("Template with embedded font created successfully!");
