import { useMemo, useRef, useEffect } from "preact/hooks";
import CharacterImage from "./CharacterImage";

export default function CharactersManager({ characters, setCharacters }) {
  const toggleOwned = (id) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, owned: !c.owned } : c))
    );
  };

  // Sort characters by element and then by name
  const sortedCharacters = useMemo(() => {
    const elementOrder = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
      "anemo",
      "geo",
    ];
    return [...characters].sort((a, b) => {
      const elementDiff =
        elementOrder.indexOf(a.element.toLowerCase()) -
        elementOrder.indexOf(b.element.toLowerCase());
      if (elementDiff !== 0) return elementDiff;
      return a.name.localeCompare(b.name);
    });
  }, [characters]);

  return (
    <div className="characters-list">
      {sortedCharacters.map((char) => (
        <CharacterCard
          key={char.id}
          character={char}
          onToggle={() => toggleOwned(char.id)}
        />
      ))}
    </div>
  );
}

function CharacterCard({ character, onToggle }) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      const span = nameRef.current;
      const parent = span.parentElement;
      const scale = Math.min(1, (parent.clientWidth - 8) / span.scrollWidth);
      span.style.setProperty("--scale", scale);
    }
  }, [character.name]);

  return (
    <div
      onClick={onToggle}
      className={`character-card character-card--${character.element.toLowerCase()} ${
        !character.owned ? "character-card--not-owned" : ""
      }`}
    >
      <CharacterImage name={character.name} className="character-card__image" />
      <div className="character-card__element"></div>
      <div className="character-card__name-container">
        <div className="character-card__name" ref={nameRef}>
          {character.name}
        </div>
      </div>
    </div>
  );
}
