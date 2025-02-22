import { useState } from "preact/hooks";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Dropdown({
  title = "Click to toggle",
  icon: Icon = null,
  children,
  className = "",
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className={`panel ${className}`}>
      <button
        onClick={toggleDropdown}
        className="team-builder__team-header"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <div className="team-builder__team-header-left">
          {Icon && <Icon className="team-builder__team-icon" size={20} />}
          <h3 className="team-builder__team-name">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="team-builder__collapse-icon" />
        ) : (
          <ChevronDown size={20} className="team-builder__collapse-icon" />
        )}
      </button>

      <div
        className={`team-builder__team-content ${
          !isOpen ? "team-builder__team-content--collapsed" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Example usage:
/*
<Dropdown title="Character Guides">
  <div className="team-builder__team-members">
    // Content goes here
  </div>
</Dropdown>
*/
