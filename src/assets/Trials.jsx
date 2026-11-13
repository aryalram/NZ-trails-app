import trails from "./TrialsData";

function Trials() {
  return (
    <div style={{ padding: "1em" }}>
      <h2>All NZ Trails</h2>
      <ul>
        {trails.map((trail) => (
          <li key={trail.id}>
            <strong>{trail.name}</strong> - {trail.region} ({trail.difficulty},{" "}
            {trail.length} km)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Trials;
