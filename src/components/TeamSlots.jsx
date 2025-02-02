import { useDroppable } from "@dnd-kit/core";
import { useRef, useEffect, useState } from "preact/hooks";
import CharacterImage from "./CharacterImage";
import GuidePopup from "./GuidePopup";

export default function TeamSlots({
  characters,
  currentTeam,
  onRemoveMember,
  onDropCharacter,
}) {
  // A helper to get character info by ID
  const getCharById = (id) => characters.find((c) => c.id === id);

  return (
    <div className="team-slots panel">
      <h2 className="team-builder__section-title">Current Team</h2>
      <div className="team-slots__container">
        {currentTeam.map((charId, index) => (
          <TeamSlot
            key={index}
            index={index}
            character={charId ? getCharById(charId) : null}
            onRemove={onRemoveMember}
            onDrop={onDropCharacter}
          />
        ))}
      </div>
    </div>
  );
}

function TeamSlot({ index, character, onRemove, onDrop }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `team-slot-${index}`,
    data: { index },
  });

  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current && character) {
      const span = nameRef.current;
      const parent = span.parentElement;
      const scale = Math.min(1, (parent.clientWidth - 8) / span.scrollWidth);
      span.style.setProperty("--scale", scale);
    }
  }, [character?.name]);

  return (
    <div
      ref={setNodeRef}
      className={`team-slot ${isOver ? "team-slot--drag-over" : ""}`}
    >
      {character ? (
        <div className="team-slot__character">
          <CharacterImage
            name={character.name}
            className="team-slot__character-image"
          />
          <div ref={nameRef} className="team-slot__character-name">
            {character.name}
          </div>
          <button
            className="team-slot__remove-button"
            onClick={() => onRemove(index)}
          >
            ×
          </button>
        </div>
      ) : (
        <div className="team-slot__placeholder">Drop Character Here</div>
      )}
    </div>
  );
}
