import { useState } from "preact/hooks";

// Add a mapping for special character image names
const CHARACTER_IMAGE_NAMES = {
  Tartaglia: "Childe",
  // Add any future special cases here
};

export default function CharacterImage({ name, className }) {
  const [isLoading, setIsLoading] = useState(true);

  // Get the correct image name from the mapping, or use the original name
  const imageName = CHARACTER_IMAGE_NAMES[name] || name;

  return (
    <div className={`character-image-container ${isLoading ? "loading" : ""}`}>
      <img
        src={`https://rerollcdn.com/GENSHIN/Characters/1/${imageName}.png`}
        alt={name}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      {isLoading && <div className="character-image-skeleton" />}
    </div>
  );
}
