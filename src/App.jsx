import { useState, useEffect, useRef } from "preact/hooks";
import { ALL_CHARACTERS } from "./data/characters.js";
import CharacterDrawer from "./components/CharacterDrawer.jsx";
import TeamSlots from "./components/TeamSlots.jsx";
import OwnedCharactersManager from "./components/CharactersManager.jsx";
import { DndContext } from "@dnd-kit/core";
import CharacterImage from "./components/CharacterImage.jsx";

export default function App() {
  // Load from local storage or fall back to defaults
  const [characters, setCharacters] = useState(() => {
    const stored = localStorage.getItem("characters");
    return stored ? JSON.parse(stored) : ALL_CHARACTERS;
  });

  const [teams, setTeams] = useState(() => {
    const stored = localStorage.getItem("teams");
    return stored ? JSON.parse(stored) : [];
  });

  const [currentTeam, setCurrentTeam] = useState([null, null, null, null]);
  const [teamName, setTeamName] = useState("");

  // Whenever characters or teams change, update local storage
  useEffect(() => {
    localStorage.setItem("characters", JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  // Handling adding a character to the current team
  const addToTeam = (charId) => {
    setCurrentTeam((prev) => {
      // find first null
      const idx = prev.indexOf(null);
      if (idx === -1) return prev;
      const newTeam = [...prev];
      newTeam[idx] = charId;
      return newTeam;
    });
  };

  // In App.jsx
  const dropCharacterInSlot = (charId, slotIndex) => {
    setCurrentTeam((prev) => {
      const newTeam = [...prev];
      newTeam[slotIndex] = charId;
      return newTeam;
    });
  };

  // Removing from the current team
  const removeFromTeam = (slotIndex) => {
    setCurrentTeam((prev) => {
      const newTeam = [...prev];
      newTeam[slotIndex] = null;
      return newTeam;
    });
  };

  // Save the current team to the teams array
  const saveTeam = () => {
    // Check for empty name
    if (!teamName.trim()) {
      console.warn("Please enter a team name");
      const input = document.querySelector(".team-builder__team-name-input");
      input.classList.add("team-builder__team-name-input--error");
      setTimeout(() => {
        input.classList.remove("team-builder__team-name-input--error");
      }, 820); // Matches shake animation duration
      return;
    }

    // Check for empty slots
    if (currentTeam.some((slot) => slot === null)) {
      console.warn("Please fill all team slots");
      const slots = document.querySelector(".team-slots__container");
      slots.classList.add("team-slots__container--error");
      setTimeout(() => {
        slots.classList.remove("team-slots__container--error");
      }, 820);
      return;
    }

    setTeams((prev) => [...prev, { teamName, members: [...currentTeam] }]);
    // Clear the current team
    setCurrentTeam([null, null, null, null]);
    setTeamName("");
  };

  // Export data (teams + owned chars) as JSON
  const handleExportData = () => {
    const dataToExport = {
      characters,
      teams,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dataToExport, null, 2));

    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "genshin-team-builder-data.json");
    anchor.click();
  };

  // Import data from a chosen JSON file
  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = JSON.parse(text);

    // Decide if you want to merge or overwrite
    if (parsed.characters) setCharacters(parsed.characters);
    if (parsed.teams) setTeams(parsed.teams);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const charId = active.id;
      const slotIndex = over.data.current.index;

      // Check if character is already in team
      if (currentTeam.includes(charId)) {
        console.warn("Character is already in team!");
        return;
      }

      dropCharacterInSlot(charId, slotIndex);
    }
  };

  // Optional: Add visual feedback for invalid drops
  const handleDragOver = ({ active, over }) => {
    // If character is already in team, we can provide visual feedback
    if (over && currentTeam.includes(active.id)) {
      return {
        dropAnimation: null,
        dragOverlay: {
          className: "character-card--invalid",
        },
      };
    }
    return null;
  };

  // Add these new functions
  const deleteTeam = (indexToDelete) => {
    setTeams((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const editTeam = (indexToEdit) => {
    const teamToEdit = teams[indexToEdit];
    setCurrentTeam(teamToEdit.members);
    setTeamName(teamToEdit.teamName);
    // Remove the team being edited
    setTeams((prev) => prev.filter((_, index) => index !== indexToEdit));
  };

  function SavedTeamMember({ character }) {
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
        className={`team-builder__team-member team-builder__team-member--${character.element.toLowerCase()}`}
      >
        <CharacterImage
          name={character.name}
          className="team-builder__team-member-image"
        />
        <span ref={nameRef} className="team-builder__team-member-name">
          {character.name}
        </span>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="team-builder">
        <h1 className="team-builder__title">Genshin Team Builder</h1>

        <div className="team-builder__save-form">
          <input
            type="text"
            className="team-builder__team-name-input"
            value={teamName}
            onInput={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
          />
          <button className="team-builder__save-button" onClick={saveTeam}>
            Save Team
          </button>
        </div>

        <TeamSlots
          characters={characters}
          currentTeam={currentTeam}
          onRemoveMember={removeFromTeam}
          onDropCharacter={dropCharacterInSlot}
        />

        <CharacterDrawer
          characters={characters}
          onSelectCharacter={addToTeam}
          currentTeam={currentTeam}
        />

        <hr className="team-builder__divider" />

        <section className="team-builder__saved-teams">
          <h2 className="team-builder__section-title">Saved Teams</h2>
          {teams.map((team, teamIndex) => (
            <div key={teamIndex} className="team-builder__team-item">
              <div className="team-builder__team-header">
                <strong className="team-builder__team-name">
                  {team.teamName}
                </strong>
                <div className="team-builder__team-actions">
                  <button
                    className="team-builder__team-action-button"
                    onClick={() => editTeam(teamIndex)}
                    title="Edit team"
                  >
                    ✎
                  </button>
                  <button
                    className="team-builder__team-action-button team-builder__team-action-button--delete"
                    onClick={() => deleteTeam(teamIndex)}
                    title="Delete team"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="team-builder__team-members">
                {team.members.map((charId, memberIndex) => {
                  const character = characters.find((c) => c.id === charId);
                  if (!character) {
                    console.warn(`Character with ID ${charId} not found`);
                    return null;
                  }
                  return (
                    <SavedTeamMember key={memberIndex} character={character} />
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <hr className="team-builder__divider" />

        <section className="team-builder__character-manager">
          <h2 className="team-builder__section-title">
            Manage Owned Characters
          </h2>
          <OwnedCharactersManager
            characters={characters}
            setCharacters={setCharacters}
          />
        </section>

        <hr className="team-builder__divider" />

        <div className="team-builder__data-controls">
          <button
            className="team-builder__export-button"
            onClick={handleExportData}
          >
            Export Data
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="team-builder__import-input"
          />
        </div>
      </div>
    </DndContext>
  );
}
