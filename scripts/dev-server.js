import express from "express";
import { handler } from "../api/generate-share-image.js";
import { join } from "path";

const app = express();
const port = 3001;
const isDev = process.env.NODE_ENV !== "production";

app.use(express.json());

app.post("/api/generate-share-image", async (req, res) => {
  await handler(req, res);
});

// Development-only preview route
if (isDev) {
  app.get("/api/preview-share-image", (req, res) => {
    try {
      const previewPath = join(
        process.cwd(),
        "public",
        "images",
        "share-preview.png"
      );
      res.sendFile(previewPath);
    } catch (error) {
      console.error("Error serving preview:", error);
      res
        .status(404)
        .send("Preview image not found. Try sharing a team first!");
    }
  });

  // Add a simple HTML preview page
  app.get("/api/preview", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Share Image Preview</title>
          <style>
            body {
              background: #2d2d2d;
              color: white;
              font-family: system-ui;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 2rem;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 8px;
              margin-top: 1rem;
            }
            .refresh {
              background: #69ff77;
              color: #2d2d2d;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <h1>Share Image Preview</h1>
          <img src="/api/preview-share-image" alt="Share preview" />
          <button class="refresh" onclick="location.reload()">Refresh Preview</button>
        </body>
      </html>
    `);
  });
}

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
  if (isDev) {
    console.log(`Preview available at http://localhost:${port}/api/preview`);
  }
});
