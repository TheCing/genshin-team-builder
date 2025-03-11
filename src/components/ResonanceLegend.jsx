import { useState } from "preact/hooks";
import { RESONANCES } from "../data/resonances";

export default function ResonanceLegend() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLegend = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`resonance-legend ${isOpen ? "resonance-legend--open" : ""}`}
    >
      <button
        className="resonance-legend__toggle"
        onClick={toggleLegend}
        aria-label={isOpen ? "Close resonance legend" : "Open resonance legend"}
      >
        {isOpen ? "Hide Resonance Effects" : "Show Resonance Effects"}
      </button>

      {isOpen && (
        <div className="resonance-legend__content">
          <h3 className="resonance-legend__title">
            Elemental Resonance Effects
          </h3>
          <div className="resonance-legend__items">
            {RESONANCES.map((resonance) => (
              <div key={resonance.id} className="resonance-legend__item">
                <div className="resonance-legend__item-header">
                  <div className="resonance-legend__icon-container">
                    {resonance.id !== "rainbow" ? (
                      <>
                        <img
                          src={`/images/${resonance.icon}`}
                          alt={resonance.name}
                          className="resonance-legend__icon"
                        />
                        <img
                          src={`/images/${resonance.icon}`}
                          alt={resonance.name}
                          className="resonance-legend__icon"
                        />
                      </>
                    ) : (
                      <div className="resonance-legend__rainbow-icon">
                        <span>4</span>
                      </div>
                    )}
                  </div>
                  <h4 className="resonance-legend__name">{resonance.name}</h4>
                </div>
                <p className="resonance-legend__description">
                  {resonance.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
