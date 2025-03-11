import { useState, useEffect } from "preact/hooks";
import { memo } from "preact/compat";

// Add a mapping for special character image names
const CHARACTER_IMAGE_NAMES = {
  Tartaglia: "Childe",
  // Add any future special cases here
};

// Custom equality function for deep comparison of props
function arePropsEqual(prevProps, nextProps) {
  // Only re-render if the character name changed
  return (
    prevProps.name === nextProps.name &&
    prevProps.className === nextProps.className
  );
}

const CharacterImage = memo(function CharacterImage({ name, className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState("");

  // Get the correct image name from the mapping, or use the original name
  const imageName = CHARACTER_IMAGE_NAMES[name] || name;

  useEffect(() => {
    // Set the image source only once per name to prevent flicker
    const src = `https://rerollcdn.com/GENSHIN/Characters/1/${imageName}.png`;
    setImageSrc(src);

    // Reset loading state when name changes
    setIsLoading(true);

    // Optionally preload the image
    const preloadImage = new Image();
    preloadImage.src = src;
    preloadImage.onload = () => setIsLoading(false);
    preloadImage.onerror = () => setIsLoading(false);

    return () => {
      // Clean up
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [imageName]);

  return (
    <div className={`character-image-container ${isLoading ? "loading" : ""}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={name}
          className={className}
          // We don't need these since we're handling loading in useEffect
          // onLoad={() => setIsLoading(false)}
          // onError={() => setIsLoading(false)}
        />
      )}
      {isLoading && <div className="character-image-skeleton" />}
    </div>
  );
}, arePropsEqual);

export default CharacterImage;
