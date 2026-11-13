function getTrailDifficulty(trail) {
  const length = trail.length || 0;
  const elevation = trail.elevation_gain || 0;

  if (elevation > 300) return "Hard";
  if (elevation > 100) return "Moderate";
  if (length > 25) return "Hard";
  if (length >= 10) return "Moderate";
  return "Easy";
}

function TrailTimeline({ trails, onSelectTrail, selectedTrail }) {
  return (
    <div
      style={{
        overflowX: "auto",
        whiteSpace: "nowrap",
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "#fdf6e3",
        borderRadius: "8px",
      }}
    >
      {trails.length > 0 ? (
        trails.map((trail) => {
          const difficulty = getTrailDifficulty(trail);
          const isSelected = selectedTrail && trail.id === selectedTrail.id;

          return (
            <div
              key={trail.id}
              onClick={() => onSelectTrail(trail)}
              title={trail.name}
              style={{
                display: "inline-block",
                padding: "12px 16px",
                marginRight: "12px",
                backgroundColor: isSelected
                  ? "#4a90e2" // blue highlight if selected
                  : difficulty === "Easy"
                  ? "#e0f7e9"
                  : difficulty === "Moderate"
                  ? "#fff3cd"
                  : "#f8d7da",
                borderRadius: "12px",
                cursor: "pointer",
                minWidth: "180px",
                textAlign: "center",
                boxShadow: isSelected
                  ? "0 4px 10px rgba(0,0,0,0.2)"
                  : "0 2px 6px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                color: isSelected ? "#fff" : "#333",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <h4 style={{ margin: "0 0 5px", fontSize: "1rem" }}>
                {trail.name}
              </h4>
              <small>
                {trail.region || "Unknown"} • {difficulty}
              </small>
            </div>
          );
        })
      ) : (
        <div style={{ padding: "10px", color: "#999", fontStyle: "italic" }}>
          ❗ No trails match your search/filter criteria.
        </div>
      )}
    </div>
  );
}

export default TrailTimeline;
