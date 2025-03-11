import { useState } from "preact/hooks";
import CharacterDrawer from "./CharacterDrawer.jsx";
import OwnedCharactersManager from "./CharactersManager.jsx";
import "../styles/character-tabs.css";

export default function CharacterTabs({
  characters,
  setCharacters,
  onSelectCharacter,
  currentTeam,
}) {
  const [activeTab, setActiveTab] = useState("characters"); // "characters" or "owned"
  const [sortBy, setSortBy] = useState("element");

  return (
    <div className="character-tabs panel">
      <div className="character-tabs__header">
        <div className="character-tabs__tab-buttons">
          <button
            className={`character-tabs__tab-button ${
              activeTab === "characters"
                ? "character-tabs__tab-button--active"
                : ""
            }`}
            onClick={() => setActiveTab("characters")}
          >
            Characters
          </button>
          <button
            className={`character-tabs__tab-button ${
              activeTab === "owned" ? "character-tabs__tab-button--active" : ""
            }`}
            onClick={() => setActiveTab("owned")}
          >
            Owned
          </button>
        </div>

        {activeTab === "characters" && (
          <div className="character-tabs__sort-container">
            <select
              className="character-drawer__sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort characters by"
            >
              <option value="element">Sort by Element</option>
              <option value="weapon">Sort by Weapon</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="alphabetical">Sort by Name</option>
            </select>
          </div>
        )}
      </div>

      <div className="character-tabs__content">
        {activeTab === "characters" && (
          <CharacterDrawer
            characters={characters}
            onSelectCharacter={onSelectCharacter}
            currentTeam={currentTeam}
            sortBy={sortBy}
          />
        )}

        {activeTab === "owned" && (
          <div className="character-tabs__owned-container">
            <div className="character-tabs__owned-header">
              <h3>Manage Owned Characters</h3>
              <p className="character-tabs__owned-description">
                Click on a character to toggle ownership status
              </p>
            </div>
            <div className="character-tabs__owned-content">
              <OwnedCharactersManager
                characters={characters}
                setCharacters={setCharacters}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
