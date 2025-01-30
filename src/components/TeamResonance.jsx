import { RESONANCES } from "../data/resonances";

function calculateTeamResonances(teamMembers) {
  // Filter out any undefined/null team members
  const validMembers = teamMembers.filter(Boolean);

  // If we don't have any valid members, return no resonances
  if (validMembers.length === 0) return [];

  // Count elements in team
  const elementCounts = validMembers.reduce((counts, char) => {
    const element = char.element.toLowerCase();
    counts[element] = (counts[element] || 0) + 1;
    return counts;
  }, {});

  // Get active resonances
  const activeResonances = [];

  // Check for element pairs
  Object.entries(elementCounts).forEach(([element, count]) => {
    if (count >= 2) {
      const resonance = RESONANCES.find((r) => r.id === element);
      if (resonance) activeResonances.push(resonance);
    }
  });

  // Check for protective canopy (all different elements)
  const uniqueElements = Object.keys(elementCounts).length;
  if (uniqueElements === 4) {
    const rainbowResonance = RESONANCES.find((r) => r.id === "rainbow");
    if (rainbowResonance) activeResonances.push(rainbowResonance);
  }

  return activeResonances;
}

export default function TeamResonance({ teamMembers }) {
  // Add safety check for undefined teamMembers
  if (!teamMembers) return null;

  const resonances = calculateTeamResonances(teamMembers);

  if (resonances.length === 0) return null;

  return (
    <div className="team-builder__resonances">
      {resonances.map((resonance) => (
        <div key={resonance.id} className="team-builder__resonance">
          <div className="team-builder__resonance-icons">
            {resonance.id !== "rainbow" && (
              <>
                <img
                  src={`/images/${resonance.icon}`}
                  alt={resonance.name}
                  className="team-builder__resonance-icon"
                />
                <img
                  src={`/images/${resonance.icon}`}
                  alt={resonance.name}
                  className="team-builder__resonance-icon"
                />
              </>
            )}
          </div>
          <div className="team-builder__resonance-info">
            <div className="team-builder__resonance-name">{resonance.name}</div>
            <div className="team-builder__resonance-description">
              {resonance.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
