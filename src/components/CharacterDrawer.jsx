import { useDraggable } from "@dnd-kit/core";
import { useMemo, useState, useRef, useEffect } from "preact/hooks";
import CharacterImage from "./CharacterImage";

export default function CharacterDrawer({
  characters,
  onSelectCharacter,
  currentTeam,
  sortBy,
}) {
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
    <div className="character-drawer">
      <div className="character-drawer__content">
        <div className="characters-list">
          {sortedCharacters.map((character) => (
            <DraggableCharacter
              key={character.id}
              character={character}
              onClick={() => onSelectCharacter(character.id)}
              isInTeam={currentTeam.includes(character.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableCharacter({ character, onClick, isInTeam }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
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

  // Create a mousedown flag to track if we're manually dragging
  const isManualDragging = useRef(false);

  const handleMouseDown = () => {
    isManualDragging.current = false;
  };

  const handleMouseMove = () => {
    isManualDragging.current = true;
  };

  const handleMouseUp = () => {
    if (!isManualDragging.current && !isInTeam) {
      onClick();
    }
    isManualDragging.current = false;
  };

  // Apply styles conditionally based on isDragging
  const cardStyle = {
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div
      ref={setNodeRef}
      className={`character-card character-card--${character.element.toLowerCase()} ${
        isInTeam ? "character-card--in-team" : ""
      }`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      {...attributes}
      {...listeners}
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
