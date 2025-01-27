import { useDraggable } from "@dnd-kit/core";
import { useMemo, useState, useRef, useEffect } from "preact/hooks";
import CharacterImage from "./CharacterImage";

export default function CharacterDrawer({
  characters,
  onSelectCharacter,
  currentTeam,
}) {
  const [sortBy, setSortBy] = useState("element");

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

    const weaponOrder = ["sword", "claymore", "polearm", "bow", "catalyst"];

    return [...characters]
      .filter((c) => c.owned)
      .sort((a, b) => {
        switch (sortBy) {
          case "element":
            const elementDiff =
              elementOrder.indexOf(a.element.toLowerCase()) -
              elementOrder.indexOf(b.element.toLowerCase());
            return elementDiff !== 0
              ? elementDiff
              : a.name.localeCompare(b.name);

          case "weapon":
            const weaponDiff =
              weaponOrder.indexOf(a.weapon.toLowerCase()) -
              weaponOrder.indexOf(b.weapon.toLowerCase());
            return weaponDiff !== 0 ? weaponDiff : a.name.localeCompare(b.name);

          case "rarity":
            const rarityDiff = b.rarity - a.rarity; // Higher rarity first
            return rarityDiff !== 0 ? rarityDiff : a.name.localeCompare(b.name);

          case "alphabetical":
            return a.name.localeCompare(b.name);

          default:
            return 0;
        }
      });
  }, [characters, sortBy]);

  return (
    <div className="character-drawer panel">
      <div className="character-drawer__header">
        <h2 className="team-builder__section-title">Character Drawer</h2>
        <select
          className="character-drawer__sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="element">Sort by Element</option>
          <option value="weapon">Sort by Weapon</option>
          <option value="rarity">Sort by Rarity</option>
          <option value="alphabetical">Sort Alphabetically</option>
        </select>
      </div>
      <div className="characters-list">
        {sortedCharacters.map((char) => (
          <DraggableCharacter
            key={char.id}
            character={char}
            onClick={() => onSelectCharacter(char.id)}
            isInTeam={currentTeam.includes(char.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableCharacter({ character, onClick, isInTeam }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: character.id,
    data: character,
    disabled: isInTeam,
  });

  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      const span = nameRef.current;
      const parent = span.parentElement;
      const scale = Math.min(1, (parent.clientWidth - 8) / span.scrollWidth);
      span.style.setProperty("--scale", scale);
    }
  }, [character.name]);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Create a mousedown flag to track if we're dragging
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = false;
  };

  const handleMouseMove = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    if (!isDragging.current && !isInTeam) {
      onClick();
    }
    isDragging.current = false;
  };

  return (
    <div
      ref={setNodeRef}
      className={`character-card character-card--${character.element.toLowerCase()} ${
        isInTeam ? "character-card--in-team" : ""
      }`}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      {...attributes}
      {...listeners}
    >
      <CharacterImage name={character.name} className="character-card__image" />
      <span ref={nameRef}>{character.name}</span>
    </div>
  );
}
