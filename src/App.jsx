import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { memo } from "preact/compat";
import { ALL_CHARACTERS } from "./data/characters.js";
import CharacterDrawer from "./components/CharacterDrawer.jsx";
import TeamSlots from "./components/TeamSlots.jsx";
import OwnedCharactersManager from "./components/CharactersManager.jsx";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import CharacterImage from "./components/CharacterImage.jsx";
import TeamResonance from "./components/TeamResonance.jsx";
import ResonanceLegend from "./components/ResonanceLegend.jsx";
import BackgroundDrawer from "./components/BackgroundDrawer.jsx";
import Dropdown from "./components/Dropdown.jsx";
import {
  Sparkles,
  Key,
  AlertTriangle,
  Settings,
  Share2,
  Edit,
  Trash,
} from "lucide-react";
import ModelSelector from "./components/ModelSelector.jsx";
import ChatBot from "./components/ChatBot.jsx";
import ApiKeyManager from "./components/ApiKeyManager.jsx";
import "./styles/api-key-manager.css";
import "./styles/api-key-button.css";
import CharacterTabs from "./components/CharacterTabs.jsx";
import BackgroundSelector from "./components/BackgroundSelector.jsx";
import "./styles/main.css";
import "./styles/settings-panel.css";

// Custom debounce hook defined outside of the component
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Create a TeamNameInput component to isolate state changes
const TeamNameInput = memo(function TeamNameInput({
  value,
  onChange,
  onKeyDown,
}) {
  const [localValue, setLocalValue] = useState(value);

  // Use local state for input value
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // Only update parent state when debounced
    onChange(newValue);
  };

  // Update local value when parent value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      type="text"
      className="team-builder__team-name-input"
      value={localValue}
      onInput={handleChange}
      onKeyDown={onKeyDown}
      placeholder="Team name"
    />
  );
});

// First, define the SavedTeam component which contains its own memoized team member
function SavedTeam({
  team,
  index,
  onDelete,
  onEdit,
  allTeamsCollapsed,
  characters,
  showGuideFor,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Define TeamMember directly within SavedTeam to avoid reference issues
  const TeamMember = memo(
    function TeamMember({ character }) {
      const nameRef = useRef(null);

      useEffect(() => {
        if (nameRef.current) {
          const span = nameRef.current;
          const parent = span.parentElement;
          const scale = Math.min(
            1,
            (parent.clientWidth - 8) / span.scrollWidth
          );
          span.style.setProperty("--scale", scale);
        }
      }, [character.name]);

      const handleCharacterClick = (e) => {
        e.stopPropagation();

        if (!character?.guides?.length) {
          return;
        }

        showGuideFor(character);
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
          <div className="team-builder__team-member-element"></div>
          <div className="team-builder__team-member-name-container">
            <span ref={nameRef} className="team-builder__team-member-name">
              {character.name}
            </span>
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => {
      return prevProps.character.id === nextProps.character.id;
    }
  );

  useEffect(() => {
    setIsCollapsed(allTeamsCollapsed);
  }, [allTeamsCollapsed]);

  const handleShare = async (e) => {
    e.stopPropagation();

    try {
      const shareData = {
        teamName: team.teamName,
        members: team.members,
      };

      // Encode team data
      const encodedData = btoa(JSON.stringify(shareData));

      // Use the share route instead of direct URL
      const shareUrl = `${window.location.origin}/share/${encodedData}`;

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
            className="team-builder__team-action-button team-builder__team-action-button--share"
            onClick={handleShare}
            title="Share team"
          >
            <Share2 size={16} />
          </button>
          <button
            className="team-builder__team-action-button"
            onClick={() => onEdit(index)}
            title="Edit team"
          >
            <Edit size={16} />
          </button>
          <button
            className="team-builder__team-action-button team-builder__team-action-button--delete"
            onClick={() => onDelete(index)}
            title="Delete team"
          >
            <Trash size={16} />
          </button>
        </div>
        {showShareTooltip && (
          <div className="team-builder__share-tooltip">Link copied!</div>
        )}
      </div>
      <div
        className={`team-builder__team-content ${
          isCollapsed ? "team-builder__team-content--collapsed" : ""
        }`}
      >
        <div className="team-builder__team-content-row">
          <div className="team-builder__team-members">
            {team.members.map((charId, memberIndex) => {
              const character = characters.find((c) => c.id === charId);
              if (!character) return null;
              return (
                <TeamMember key={charId || memberIndex} character={character} />
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
    </div>
  );
}

// Then, define MemoizedSavedTeam
const MemoizedSavedTeam = memo(SavedTeam);

// Stable equality function for SavedTeamsContainer
const savedTeamsContainerPropsAreEqual = (prevProps, nextProps) => {
  // Custom equality function - only update if these props changed
  return (
    prevProps.teams === nextProps.teams &&
    prevProps.characters === nextProps.characters &&
    prevProps.allTeamsCollapsed === nextProps.allTeamsCollapsed &&
    prevProps.showGuideFor === nextProps.showGuideFor &&
    prevProps.onDeleteTeam === nextProps.onDeleteTeam &&
    prevProps.onEditTeam === nextProps.onEditTeam
  );
};

// Now define SavedTeamsContainer which uses MemoizedSavedTeam
const SavedTeamsContainer = memo(function SavedTeamsContainer({
  teams,
  characters,
  showGuideFor,
  onDeleteTeam,
  onEditTeam,
  allTeamsCollapsed,
}) {
  // If no teams, show empty state
  if (teams.length === 0) {
    return (
      <p className="team-builder__empty-state">No teams saved. Get building!</p>
    );
  }

  // Render the teams
  return (
    <>
      {teams.map((team, index) => (
        <MemoizedSavedTeam
          key={team.id || index} // Use a stable key if possible
          team={team}
          index={index}
          onDelete={() => onDeleteTeam(index)}
          onEdit={() => onEditTeam(index)}
          allTeamsCollapsed={allTeamsCollapsed}
          characters={characters}
          showGuideFor={showGuideFor}
        />
      ))}
    </>
  );
},
savedTeamsContainerPropsAreEqual);

// Animated button component for the "Generating..." state
function AnimatedGeneratingButton({ disabled }) {
  const [text, setText] = useState("Generating");

  useEffect(() => {
    // Animation interval for the dots
    const interval = setInterval(() => {
      setText((prevText) => {
        if (prevText === "Generating") return "Generating.";
        if (prevText === "Generating.") return "Generating..";
        if (prevText === "Generating..") return "Generating...";
        return "Generating";
      });
    }, 500); // Change dots every 500ms for a smooth animation

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      type="submit"
      className="team-builder__save-button team-builder__generating-button"
      disabled={disabled}
    >
      {text}
    </button>
  );
}

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
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState({
    deepseek: false,
    perplexity: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(() => {
    return localStorage.getItem("selectedBackground") || "none";
  });
  const [activeId, setActiveId] = useState(null);
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [activeGuide, setActiveGuide] = useState(null);

  // Use useRef to keep reference to current teams without causing re-renders
  const teamsRef = useRef(teams);

  // Update the ref when teams change
  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  // Whenever characters or teams change, update local storage
  useEffect(() => {
    localStorage.setItem("characters", JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  // Check if API keys exist
  useEffect(() => {
    const checkApiKeys = () => {
      const deepseekKey = localStorage.getItem("user_deepseek_key");
      const perplexityKey = localStorage.getItem("user_perplexity_key");

      setApiKeyStatus({
        deepseek: !!deepseekKey,
        perplexity: !!perplexityKey,
      });
    };

    // Check on mount and when the API key manager closes
    checkApiKeys();

    // Add event listener for storage changes (in case keys are updated in another tab)
    window.addEventListener("storage", checkApiKeys);

    return () => window.removeEventListener("storage", checkApiKeys);
  }, [isApiKeyManagerOpen]);

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

  const clearTeam = () => {
    setCurrentTeam([null, null, null, null]);
  };

  // Save the current team to the teams array
  const saveTeam = () => {
    // Validate
    if (!teamName.trim()) {
      // Highlight the input
      document
        .querySelector(".team-builder__team-name-input")
        .classList.add("team-builder__team-name-input--error");
      setTimeout(() => {
        document
          .querySelector(".team-builder__team-name-input")
          .classList.remove("team-builder__team-name-input--error");
      }, 800);
      return;
    }

    if (!currentTeam.some(Boolean)) {
      // Highlight the team slots
      document
        .querySelector(".team-slots__container")
        .classList.add("team-slots__container--error");
      setTimeout(() => {
        document
          .querySelector(".team-slots__container")
          .classList.remove("team-slots__container--error");
      }, 800);
      return;
    }

    // Create a unique ID for this team
    const newTeam = {
      id: `team-${Date.now()}`,
      teamName,
      members: [...currentTeam],
    };

    setTeams((prev) => [...prev, newTeam]);
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

    // Reset active drag state
    setActiveId(null);
    setActiveCharacter(null);

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
          className: "character-card--invalid dragging",
        },
      };
    }
    return {
      dropAnimation: null,
    };
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    const draggedCharacter = characters.find((c) => c.id === active.id);
    setActiveCharacter(draggedCharacter);
  };

  // Create stable callbacks
  const deleteTeam = useCallback((indexToDelete) => {
    const teamToDelete = teamsRef.current[indexToDelete];
    if (
      confirm(
        `Are you sure you want to delete team "${teamToDelete.teamName}"?`
      )
    ) {
      setTeams((prev) => prev.filter((_, index) => index !== indexToDelete));
    }
  }, []);

  const editTeam = useCallback((indexToEdit) => {
    const teamToEdit = teamsRef.current[indexToEdit];
    setCurrentTeam(teamToEdit.members);
    setTeamName(teamToEdit.teamName);
    // Remove the team being edited
    setTeams((prev) => prev.filter((_, index) => index !== indexToEdit));
  }, []);

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

  // Debounced teamName setter
  const debouncedSetTeamName = useDebounce((value) => {
    setTeamName(value);
  }, 100);

  // Handler for team name input
  const handleTeamNameInput = (e) => {
    // No need to redundantly assign e.target.value
    // Just pass the value to the debounced function
    debouncedSetTeamName(e.target.value);
  };

  // Add this handler to handle the Enter key
  const handleTeamNameKeyDown = (e) => {
    if (e.key === "Enter") {
      saveTeam();
    }
  };

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
    // Handle the new share URL format
    const pathParts = window.location.pathname.split("/");
    if (pathParts[1] === "share" && pathParts[2]) {
      try {
        const decodedTeam = JSON.parse(atob(pathParts[2]));
        setCurrentTeam(decodedTeam.members);
        setTeamName(decodedTeam.teamName);

        // Update URL to root
        window.history.replaceState({}, "", "/");

        // Scroll to team builder
        document
          .querySelector(".team-builder__save-form")
          ?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error("Error loading shared team:", err);
      }
    }
  }, []);

  const handleAiTeamSubmit = async (e) => {
    e.preventDefault();

    // Check if user has provided API keys
    const deepseekKey = localStorage.getItem("user_deepseek_key");
    const perplexityKey = localStorage.getItem("user_perplexity_key");

    // Check if the selected model's API key is available
    if (selectedModel === "deepseek-chat" && !deepseekKey) {
      setGenerationError(
        "Please provide your Deepseek API key to use this feature"
      );
      setIsApiKeyManagerOpen(true);
      return;
    }

    if (selectedModel === "sonar" && !perplexityKey) {
      setGenerationError(
        "Please provide your Perplexity API key to use this feature"
      );
      setIsApiKeyManagerOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add the appropriate user API key based on selected model
      if (selectedModel === "deepseek-chat") {
        headers["X-User-API-Key"] = deepseekKey;
      } else if (selectedModel === "sonar") {
        headers["X-User-API-Key"] = perplexityKey;
      }

      const response = await fetch("/api/generate-team", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: aiPrompt,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key");
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const { team } = await response.json();
      const teamIds = team
        .map((name) => characters.find((c) => c.name === name)?.id)
        .filter(Boolean);

      setCurrentTeam(teamIds);
      setAiPrompt("");
    } catch (error) {
      console.error("Error in team generation:", error);
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackgroundChange = (newBackground) => {
    setSelectedBackground(newBackground);

    // Apply the background immediately
    if (newBackground && newBackground !== "none") {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${newBackground})`;
    } else {
      document.body.style.backgroundImage = "none";
    }

    // Save to localStorage
    localStorage.setItem("selectedBackground", newBackground);
  };

  // Use useCallback to make this function stable across renders
  const showGuideFor = useCallback((character) => {
    if (character?.guides?.length) {
      setActiveGuide(character);
    }
  }, []);

  // Use useCallback for the close guide function as well
  const closeGuide = useCallback(() => {
    setActiveGuide(null);
  }, []);

  // Add keyboard event handler for escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeGuide) {
        closeGuide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGuide]);

  // Lock page scrolling when popup is open
  useEffect(() => {
    if (activeGuide) {
      // Save the current scroll position
      const scrollY = window.scrollY;

      // Add styles to lock scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scrolling when popup closes
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [activeGuide]);

  // Apply the background when the app loads
  useEffect(() => {
    const applyBackground = () => {
      const bgPath = selectedBackground;
      if (bgPath && bgPath !== "none") {
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bgPath})`;
      } else {
        document.body.style.backgroundImage = "none";
      }
    };

    applyBackground();
  }, [selectedBackground]);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="team-builder">
        <div className="team-builder__header">
          <div className="team-builder__logo-container">
            <img
              src="/images/genshin-logo-subdued.svg"
              alt="Genshin Team Builder"
              className="team-builder__logo"
            />
          </div>

          <button
            className="team-builder__settings-button"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <Settings size={24} />
          </button>
        </div>

        <div className="team-builder__left-column">
          <CharacterTabs
            characters={characters}
            setCharacters={setCharacters}
            onSelectCharacter={addToTeam}
            currentTeam={currentTeam}
          />
        </div>

        <div className="team-builder__right-column">
          <div className="team-builder__save-form">
            <TeamNameInput
              value={teamName}
              onChange={debouncedSetTeamName}
              onKeyDown={handleTeamNameKeyDown}
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
            onClearTeam={clearTeam}
          />

          <Dropdown
            title="Try out AI team building (beta)"
            icon={Sparkles}
            defaultOpen={false}
          >
            {!apiKeyStatus.deepseek && !apiKeyStatus.perplexity && (
              <div className="ai-team-generator__no-keys-warning">
                <AlertTriangle size={16} />
                <span>You need to provide API keys to use AI features.</span>
                <button onClick={() => setIsApiKeyManagerOpen(true)}>
                  Add API Keys
                </button>
              </div>
            )}

            <form
              onSubmit={handleAiTeamSubmit}
              className="team-builder__ai-form"
            >
              <div className="team-builder__model-selector-row">
                <ModelSelector
                  model={selectedModel}
                  onModelChange={setSelectedModel}
                  apiKeyStatus={apiKeyStatus}
                />
                <button
                  className="team-builder__api-key-button team-builder__api-key-button--inline"
                  onClick={() => setIsApiKeyManagerOpen(true)}
                  title="Manage API Keys"
                >
                  <Key size={16} />
                  API Keys
                  {!apiKeyStatus.deepseek && !apiKeyStatus.perplexity && (
                    <AlertTriangle
                      size={12}
                      className="team-builder__api-key-warning"
                    />
                  )}
                </button>
              </div>

              <div className="team-builder__ai-form-row">
                <input
                  type="text"
                  value={aiPrompt}
                  onInput={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the team you want to build..."
                  className="team-builder__team-name-input"
                  disabled={
                    isGenerating ||
                    (selectedModel === "deepseek-chat" &&
                      !apiKeyStatus.deepseek) ||
                    (selectedModel === "sonar" && !apiKeyStatus.perplexity)
                  }
                />
                {isGenerating ? (
                  <AnimatedGeneratingButton disabled={true} />
                ) : (
                  <button
                    type="submit"
                    className="team-builder__save-button"
                    disabled={
                      (selectedModel === "deepseek-chat" &&
                        !apiKeyStatus.deepseek) ||
                      (selectedModel === "sonar" && !apiKeyStatus.perplexity)
                    }
                  >
                    Generate Team
                  </button>
                )}
              </div>
            </form>
            {generationError && (
              <p className="team-builder__error-message">{generationError}</p>
            )}
          </Dropdown>

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
            <ResonanceLegend />
            <SavedTeamsContainer
              teams={teams}
              characters={characters}
              showGuideFor={showGuideFor}
              onDeleteTeam={deleteTeam}
              onEditTeam={editTeam}
              allTeamsCollapsed={allTeamsCollapsed}
            />
          </section>

          <div className="team-builder__data-controls">
            <button
              className="data-control-button team-builder__export-button"
              onClick={handleExportData}
            >
              Export Data
            </button>
            <input
              type="file"
              id="import-data"
              accept=".json"
              onChange={handleImportData}
              className="team-builder__import-input"
            />
            <label
              htmlFor="import-data"
              className="data-control-button team-builder__export-button"
            >
              Import Data
            </label>
          </div>

          <div className="team-builder__danger-zone">
            <h2 className="team-builder__section-title">Danger Zone</h2>
            <button
              className="data-control-button team-builder__delete-all-button"
              onClick={handleDeleteAllData}
            >
              Delete All Data
            </button>
          </div>
        </div>

        {/* Site Footer */}
        <footer className="site-footer">
          <p>
            Genshin Team Builder © 2024 |
            <a
              href="https://github.com/TheCing/genshin-team-builder"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              GitHub
            </a>{" "}
            | Built with{" "}
            <a
              href="https://preactjs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preact
            </a>
            ,{" "}
            <a
              href="https://vitejs.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vite
            </a>
            , and{" "}
            <a
              href="https://dndkit.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              dnd kit
            </a>{" "}
            | Not affiliated with HoYoverse
          </p>
        </footer>

        {isSettingsOpen && (
          <div className="settings-panel">
            <div
              className="settings-panel__overlay"
              onClick={() => setIsSettingsOpen(false)}
            ></div>
            <div className="settings-panel__content">
              <div className="settings-panel__header">
                <h2>Settings</h2>
                <button
                  className="settings-panel__close-button"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="settings-panel__section">
                <h3 className="settings-panel__section-title">Background</h3>
                <p className="settings-panel__section-description">
                  Choose a background image for the app.
                </p>
                <BackgroundSelector
                  selectedBackground={selectedBackground}
                  onSelectBackground={handleBackgroundChange}
                />
              </div>

              <div className="settings-panel__section">
                <h3 className="settings-panel__section-title">API Keys</h3>
                <p className="settings-panel__section-description">
                  Manage your API keys for AI features.
                </p>
                <button
                  className="settings-panel__api-key-button"
                  onClick={() => setIsApiKeyManagerOpen(true)}
                >
                  <Key size={16} />
                  Manage API Keys
                  {!apiKeyStatus.deepseek && !apiKeyStatus.perplexity && (
                    <AlertTriangle
                      size={12}
                      className="team-builder__api-key-warning"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isApiKeyManagerOpen && (
          <ApiKeyManager
            isOpen={isApiKeyManagerOpen}
            onClose={() => setIsApiKeyManagerOpen(false)}
          />
        )}

        <ChatBot
          apiKeyStatus={apiKeyStatus}
          onNeedApiKey={() => setIsApiKeyManagerOpen(true)}
          characters={characters}
          currentTeam={currentTeam.map((id) =>
            id ? characters.find((c) => c.id === id) : null
          )}
          teams={teams}
        />
      </div>

      {/* Global guide popup */}
      {activeGuide && (
        <div className="global-popup-backdrop" onClick={closeGuide}>
          <div className="guide-popup" onClick={(e) => e.stopPropagation()}>
            <div className="guide-popup__header">
              <h3>{activeGuide.name} Guides</h3>
              <button className="guide-popup__close" onClick={closeGuide}>
                ×
              </button>
            </div>

            <div className="guide-popup__content">
              {activeGuide.guides &&
                activeGuide.guides.map((guide, index) => (
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
        </div>
      )}

      {/* DragOverlay to ensure dragged items appear on top */}
      <DragOverlay className="dnd-overlay" dropAnimation={null} zIndex={9999}>
        {activeId && activeCharacter && (
          <div
            className={`character-card character-card--${activeCharacter.element.toLowerCase()} dragging`}
          >
            <CharacterImage
              name={activeCharacter.name}
              className="character-card__image"
            />
            <div className="character-card__element"></div>
            <div className="character-card__name-container">
              <div className="character-card__name">{activeCharacter.name}</div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
