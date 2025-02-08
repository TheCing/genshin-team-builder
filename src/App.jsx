import { useState, useEffect, useRef } from "preact/hooks";
import { ALL_CHARACTERS } from "./data/characters.js";
import CharacterDrawer from "./components/CharacterDrawer.jsx";
import TeamSlots from "./components/TeamSlots.jsx";
import OwnedCharactersManager from "./components/CharactersManager.jsx";
import { DndContext } from "@dnd-kit/core";
import CharacterImage from "./components/CharacterImage.jsx";
import TeamResonance from "./components/TeamResonance.jsx";
import BackgroundDrawer from "./components/BackgroundDrawer.jsx";
import GuidePopup from "./components/GuidePopup.jsx";
import { generateSharePreview } from "./api/generate-share-image.js";

export default function App() {
  // Load from local storage or fall back to defaults
  const [characters, setCharacters] = useState(() => {
    const stored = localStorage.getItem("characters");
    if (!stored) return ALL_CHARACTERS;

    const storedCharacters = JSON.parse(stored);

    // Create a map of stored characters for quick lookup
    const storedCharMap = new Map(
      storedCharacters.map((char) => [char.id, char])
    );

    // Merge ALL_CHARACTERS with stored data, keeping ownership status
    return ALL_CHARACTERS.map((char) => {
      const storedChar = storedCharMap.get(char.id);
      return storedChar ? { ...char, owned: storedChar.owned } : char;
    });
  });

  const [teams, setTeams] = useState(() => {
    const stored = localStorage.getItem("teams");
    return stored ? JSON.parse(stored) : [];
  });

  const [currentTeam, setCurrentTeam] = useState([null, null, null, null]);
  const [teamName, setTeamName] = useState("");
  const [allTeamsCollapsed, setAllTeamsCollapsed] = useState(false);

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
    const teamToDelete = teams[indexToDelete];
    if (
      window.confirm(
        `Are you sure you want to delete the team "${teamToDelete.teamName}"?`
      )
    ) {
      setTeams((prev) => prev.filter((_, index) => index !== indexToDelete));
    }
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
    const [showGuides, setShowGuides] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      if (nameRef.current) {
        const span = nameRef.current;
        const parent = span.parentElement;
        const scale = Math.min(1, (parent.clientWidth - 8) / span.scrollWidth);
        span.style.setProperty("--scale", scale);
      }
    }, [character.name]);

    const handleCharacterClick = (e) => {
      e.stopPropagation();

      console.log("Character clicked:", character?.name);
      console.log("Has guides:", character?.guides?.length > 0);

      if (!character?.guides?.length) {
        console.log("No guides available for", character?.name);
        return;
      }

      // Calculate position for popup, accounting for scroll and viewport
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const viewportWidth = window.innerWidth;

      // Check if there's enough space on the right
      const spaceOnRight = viewportWidth - rect.right;
      const popupWidth = 200; // Minimum width of the popup
      const padding = 10; // Desired padding from edge

      const newPosition = {
        x:
          spaceOnRight >= popupWidth + padding
            ? rect.right + scrollLeft + padding // Show on right
            : rect.left + scrollLeft - popupWidth - padding, // Show on left
        y: rect.top + scrollTop,
      };

      console.log("Popup position:", newPosition);
      console.log("Space on right:", spaceOnRight);

      setPopupPosition(newPosition);
      setShowGuides(true);
      console.log("Show guides set to true");
    };

    return (
      <div
        className={`team-builder__team-member team-builder__team-member--${character.element.toLowerCase()} ${
          character.guides?.length
            ? "team-builder__team-member--has-guides"
            : ""
        }`}
        onClick={handleCharacterClick}
      >
        <CharacterImage
          name={character.name}
          className="team-builder__team-member-image"
        />
        <span ref={nameRef} className="team-builder__team-member-name">
          {character.name}
        </span>
        {showGuides && (
          <GuidePopup
            character={character}
            position={popupPosition}
            onClose={(e) => {
              if (e) e.stopPropagation();
              console.log("Closing guide popup for", character?.name);
              setShowGuides(false);
            }}
          />
        )}
      </div>
    );
  }

  const handleDeleteAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all data? This will remove all teams and reset character ownership."
      )
    ) {
      if (
        window.confirm(
          "This action cannot be undone. Really delete everything?"
        )
      ) {
        // Reset all states
        setTeams([]);
        setCharacters(ALL_CHARACTERS); // This resets to default character list
        setCurrentTeam([null, null, null, null]);
        setTeamName("");

        // Clear localStorage
        localStorage.removeItem("teams");
        localStorage.removeItem("characters");
      }
    }
  };

  // Add this handler to handle the Enter key
  const handleTeamNameKeyDown = (e) => {
    if (e.key === "Enter") {
      saveTeam();
    }
  };

  function SavedTeam({ team, index, onDelete, onEdit, allTeamsCollapsed }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);

    useEffect(() => {
      setIsCollapsed(allTeamsCollapsed);
    }, [allTeamsCollapsed]);

    const updateMetaTags = (teamData) => {
      // Create temporary meta tags for sharing
      const metaTags = [
        { property: "og:title", content: `Genshin Team: ${teamData.teamName}` },
        {
          property: "og:description",
          content: `Team members: ${teamData.members
            .map((id) => characters.find((c) => c.id === id)?.name)
            .filter(Boolean)
            .join(", ")}`,
        },
        {
          property: "og:image",
          content: `${window.location.origin}/images/share-preview.png`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: `Genshin Team: ${teamData.teamName}`,
        },
        {
          name: "twitter:description",
          content: `Team members: ${teamData.members
            .map((id) => characters.find((c) => c.id === id)?.name)
            .filter(Boolean)
            .join(", ")}`,
        },
        {
          name: "twitter:image",
          content: `${window.location.origin}/images/share-preview.png`,
        },
      ];

      // Remove any existing temporary meta tags
      document
        .querySelectorAll('meta[data-temporary="true"]')
        .forEach((tag) => tag.remove());

      // Add new meta tags
      metaTags.forEach(({ property, name, content }) => {
        const meta = document.createElement("meta");
        if (property) meta.setAttribute("property", property);
        if (name) meta.setAttribute("name", name);
        meta.setAttribute("content", content);
        meta.setAttribute("data-temporary", "true");
        document.head.appendChild(meta);
      });

      // Return cleanup function
      return () => {
        document
          .querySelectorAll('meta[data-temporary="true"]')
          .forEach((tag) => tag.remove());
      };
    };

    const handleShare = async (e) => {
      e.stopPropagation();

      try {
        // Generate share image via API
        await generateSharePreview({
          teamName: team.teamName,
          members: team.members
            .map((id) => {
              const char = characters.find((c) => c.id === id);
              return char ? char.name : null;
            })
            .filter(Boolean),
        });

        // Create shareable data
        const shareData = {
          teamName: team.teamName,
          members: team.members,
        };

        // Encode team data
        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?team=${encodedData}`;

        // Update meta tags before sharing
        const cleanupMetaTags = updateMetaTags(shareData);

        // Only use Share API on mobile devices
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
          await navigator.share({
            title: `Genshin Team: ${team.teamName}`,
            text: `Check out my Genshin Impact team: ${team.teamName}`,
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          setShowShareTooltip(true);
          setTimeout(() => setShowShareTooltip(false), 2000);
        }

        // Clean up meta tags after a short delay to allow for sharing
        setTimeout(cleanupMetaTags, 5000);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    };

    return (
      <div className="team-builder__team-item">
        <div className="team-builder__team-header">
          <div className="team-builder__team-header-left">
            <button
              className={`team-builder__collapse-button ${
                isCollapsed ? "team-builder__collapse-button--collapsed" : ""
              }`}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand team" : "Collapse team"}
            >
              ▼
            </button>
            <h3 className="team-builder__team-name">{team.teamName}</h3>
          </div>
          <div className="team-builder__team-actions">
            <button
              className="team-builder__team-action-button"
              onClick={handleShare}
              title="Share team"
            >
              ⤴
            </button>
            <button
              className="team-builder__team-action-button"
              onClick={() => onEdit(index)}
              title="Edit team"
            >
              ✎
            </button>
            <button
              className="team-builder__team-action-button team-builder__team-action-button--delete"
              onClick={() => onDelete(index)}
              title="Delete team"
            >
              ×
            </button>
          </div>
          {showShareTooltip && (
            <div className="team-builder__share-tooltip">
              Link copied to clipboard!
            </div>
          )}
        </div>
        <div
          className={`team-builder__team-content ${
            isCollapsed ? "team-builder__team-content--collapsed" : ""
          }`}
        >
          <div className="team-builder__team-members">
            {team.members.map((charId, memberIndex) => {
              const character = characters.find((c) => c.id === charId);
              if (!character) return null;
              return (
                <SavedTeamMember key={memberIndex} character={character} />
              );
            })}
          </div>
          <TeamResonance
            teamMembers={team.members
              .map((id) => characters.find((c) => c.id === id))
              .filter(Boolean)}
          />
        </div>
      </div>
    );
  }

  const handleCollapseAll = () => {
    setAllTeamsCollapsed(true);
  };

  const handleExpandAll = () => {
    setAllTeamsCollapsed(false);
  };

  // Add this effect to handle shared teams
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTeam = params.get("team");

    if (sharedTeam) {
      try {
        const decodedTeam = JSON.parse(atob(sharedTeam));
        setCurrentTeam(decodedTeam.members);
        setTeamName(decodedTeam.teamName);

        // Clear the URL parameter
        window.history.replaceState({}, "", window.location.pathname);

        // Scroll to team builder
        document
          .querySelector(".team-builder__save-form")
          ?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error("Error loading shared team:", err);
      }
    }
  }, []);

  return (
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <BackgroundDrawer />
      <div className="team-builder">
        <h1 className="team-builder__title">Genshin Team Builder</h1>

        <div className="team-builder__save-form">
          <input
            type="text"
            className="team-builder__team-name-input"
            value={teamName}
            onInput={(e) => setTeamName(e.target.value)}
            onKeyDown={handleTeamNameKeyDown}
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
          <div className="team-builder__section-header">
            <h2 className="team-builder__section-title">Saved Teams</h2>
            <div className="team-builder__section-controls">
              <button
                className="team-builder__collapse-all-button"
                onClick={handleCollapseAll}
                title="Collapse all teams"
              >
                Collapse All
              </button>
              <button
                className="team-builder__collapse-all-button"
                onClick={handleExpandAll}
                title="Expand all teams"
              >
                Expand All
              </button>
            </div>
          </div>
          <p className="team-builder__section-description">
            Click on a character to view their guides.
          </p>
          {teams.length === 0 ? (
            <p className="team-builder__empty-state">
              No teams saved. Get building!
            </p>
          ) : (
            teams.map((team, teamIndex) => (
              <SavedTeam
                key={teamIndex}
                team={team}
                index={teamIndex}
                onDelete={deleteTeam}
                onEdit={editTeam}
                allTeamsCollapsed={allTeamsCollapsed}
              />
            ))
          )}
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

        <div className="team-builder__danger-zone">
          <h2 className="team-builder__section-title">Danger Zone</h2>
          <button
            className="team-builder__delete-all-button"
            onClick={handleDeleteAllData}
          >
            Delete All Data
          </button>
        </div>

        <footer className="team-builder__footer">
          <div className="team-builder__footer-content">
            <span>Crafted by cing</span>
            <span>
              Built with{" "}
              <a
                href="https://preactjs.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Preact
              </a>
            </span>
            <a
              href="https://github.com/TheCing/genshin-team-builder/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="team-builder__feedback-button"
            >
              Give Feedback
            </a>
          </div>
        </footer>
      </div>
    </DndContext>
  );
}
