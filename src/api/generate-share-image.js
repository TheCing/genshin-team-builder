export async function generateSharePreview(teamData) {
  try {
    const response = await fetch("/api/generate-share-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teamData),
    });

    if (!response.ok) {
      throw new Error("Failed to generate share image");
    }

    return true;
  } catch (err) {
    console.error("Error generating share image:", err);
    return false;
  }
}
