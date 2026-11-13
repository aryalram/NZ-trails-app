import ElevationChart from "./ElevationChart";

function TrailDetail({ trail }) {
  if (!trail) return null;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        marginTop: "30px",
        maxWidth: "900px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h2 style={{ marginBottom: "10px", color: "#2c3e50" }}>{trail.name}</h2>
      <p>
        <strong>Region:</strong> {trail.region || "Unknown"}
      </p>
      <p>
        <strong>Difficulty:</strong> {trail.difficulty || "Moderate"}
      </p>
      <p>
        <strong>Length:</strong> {trail.length.toFixed(2)} km
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {trail.description || "No description available."}
      </p>

      {trail.elevation && trail.elevation.length > 0 ? (
        <ElevationChart data={trail.elevation} />
      ) : (
        <p style={{ color: "#888", marginTop: "20px" }}>
          📉 No elevation data available for this trail.
        </p>
      )}
    </div>
  );
}

export default TrailDetail;
