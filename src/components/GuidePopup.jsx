import { useState, useEffect, useRef } from "preact/hooks";

export default function GuidePopup({ character, position, onClose }) {
  const popupRef = useRef(null);
  console.log("GuidePopup rendered for:", character?.name);
  console.log("Position:", position);
  console.log("Available guides:", character?.guides);

  useEffect(() => {
    // Close popup when clicking outside
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        console.log("Click outside detected, closing popup");
        onClose();
      }
    }

    console.log("Adding click outside listener");
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      console.log("Removing click outside listener");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!character.guides || character.guides.length === 0) {
    console.log("No guides available, not rendering popup");
    return null;
  }

  const handleClose = (e) => {
    e.stopPropagation(); // Stop event propagation
    onClose(e);
  };

  return (
    <div
      className="guide-popup"
      ref={popupRef}
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      onClick={(e) => e.stopPropagation()} // Stop clicks from reaching parent
    >
      <div className="guide-popup__header">
        <h3>{character.name} Guides</h3>
        <button className="guide-popup__close" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="guide-popup__content">
        {character.guides.map((guide, index) => (
          <a
            key={index}
            href={guide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="guide-popup__link"
          >
            {guide.title}
          </a>
        ))}
      </div>
      <div className="guide-popup__footer">
        <small>Guides provided by KQM</small>
      </div>
    </div>
  );
}
