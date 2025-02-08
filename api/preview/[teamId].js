import { handler as generateShareImage } from "../generate-share-image";

export default async function handler(req, res) {
  const { teamId } = req.query;
  const teamData = JSON.parse(atob(teamId));

  // Set content type for image
  res.setHeader("Content-Type", "image/png");

  // Generate and return the image directly
  await generateShareImage(
    {
      ...req,
      body: teamData,
    },
    res
  );
}
