import { useState } from "preact/hooks";

export default function CharacterImage({ name, className }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`character-image-container ${isLoading ? "loading" : ""}`}>
      <img
        src={`https://rerollcdn.com/GENSHIN/Characters/1/${name}.png`}
        alt={name}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      {isLoading && <div className="character-image-skeleton" />}
    </div>
  );
}
