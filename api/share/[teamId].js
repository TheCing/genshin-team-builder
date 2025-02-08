import { handler as generateShareImage } from "../generate-share-image";

export default function handler(req, res) {
  const { teamId } = req.query;

  // Decode team data from URL
  const teamData = JSON.parse(atob(teamId));

  // Generate HTML with correct meta tags
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="${teamData.teamName} - Genshin Team Builder" />
        <meta property="og:image" content="https://genshin-team-builder.vercel.app/api/preview/${teamId}" />
        <meta property="og:url" content="https://genshin-team-builder.vercel.app/share/${teamId}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta http-equiv="refresh" content="0;url=/?team=${teamId}" />
      </head>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
}
