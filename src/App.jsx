import { useState, useEffect } from "react";
import MapView from "./MapView.jsx";
import TrailTimeline from "./TrailTimeline.jsx";
import TrailDetail from "./TrailDetail.jsx";
import ElevationChart from "./ElevationChart.jsx";
import WeatherInfo from "./WeatherInfo.jsx";
import "./App.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function normalizeCoordinates(coords) {
  if (Array.isArray(coords?.[0]) && Array.isArray(coords[0][0])) {
    return coords.flat();
  }
  return coords;
}

async function fetchElevationFromGoogle(coords, apiKey) {
  if (!coords || coords.length < 2) return [];

  const sampled = coords.filter((_, i) => i % 10 === 0).slice(0, 300);
  const path = sampled.map(([lng, lat]) => `${lat},${lng}`).join("|");

  const url = `https://maps.googleapis.com/maps/api/elevation/json?path=${encodeURIComponent(
    path
  )}&samples=${sampled.length}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "OK") {
      return json.results.map((r) => r.elevation);
    } else {
      console.error(
        "Google Elevation API Error:",
        json.status,
        json.error_message
      );
      return [];
    }
  } catch (err) {
    console.error("Elevation fetch failed:", err);
    return [];
  }
}

function calculateTrailLength(coords) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += 6371 * c;
  }
  return parseFloat(total.toFixed(2));
}

function calculateElevationGain(elevations) {
  let gain = 0;
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) gain += diff;
  }
  return Math.round(gain);
}

function getTrailDifficulty(length, elevationGain) {
  if (elevationGain > 300) return "Hard";
  if (elevationGain > 100) return "Moderate";
  if (length > 25) return "Hard";
  if (length >= 10) return "Moderate";
  return "Easy";
}

function App() {
  const [trails, setTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/assets/nz-full-named-trails.geojson")
      .then((res) => res.json())
      .then(async (data) => {
        const features = data.features
          .slice(0, 300)
          .map((f, i) => {
            let coords = normalizeCoordinates(f.geometry?.coordinates);
            if (!Array.isArray(coords) || coords.length < 2) return null;

            const firstCoord = coords[0];
            const lengthKm = calculateTrailLength(coords);

            return {
              id: f.properties.id || i,
              name: f.properties.name || "Unnamed Trail",
              region: f.properties.locality || "Unknown",
              season: f.properties.season || "",
              lat: firstCoord[1],
              lng: firstCoord[0],
              geometry: coords,
              elevation: [],
              scenery: f.properties.scenery || "",
              length: lengthKm,
            };
          })
          .filter(Boolean);

        for (let i = 0; i < features.length; i++) {
          const trail = features[i];
          if (
            i < 20 &&
            Array.isArray(trail.geometry) &&
            trail.geometry.length > 1
          ) {
            trail.elevation = await fetchElevationFromGoogle(
              trail.geometry,
              GOOGLE_API_KEY
            );
            if (!trail.elevation || trail.elevation.length === 0) {
              trail.elevation = [150, 152, 148, 155, 157];
            }
          } else {
            trail.elevation = [];
          }

          const elevationGain = calculateElevationGain(trail.elevation);
          trail.elevation_gain = elevationGain;
          trail.difficulty = getTrailDifficulty(trail.length, elevationGain);
        }

        setTrails(features);
      });
  }, []);

  const filteredTrails = trails.filter((trail) => {
    const name = trail.name?.toLowerCase() || "";
    const difficulty = trail.difficulty?.toLowerCase() || "";
    const region = trail.region?.toLowerCase() || "";
    const season = trail.season?.toLowerCase() || "";
    const scenery = trail.scenery?.toLowerCase() || "";
    const trailLength = trail.length || 0;
    const filterLower = filter.toLowerCase();

    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterLower === "all" ||
      difficulty === filterLower ||
      region === filterLower ||
      season === filterLower ||
      scenery.includes(filterLower) ||
      (filterLower === "short" && trailLength < 10) ||
      (filterLower === "medium" && trailLength >= 10 && trailLength <= 25) ||
      (filterLower === "long" && trailLength > 25);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="App" style={{ maxWidth: "100vw", overflowX: "hidden" }}>
      <h1
        style={{ textAlign: "center", marginTop: "20px", marginBottom: "10px" }}
      >
        NZ Trails Explorer
      </h1>

      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Search trails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            marginRight: "10px",
            width: "50%",
            borderRadius: "5px",
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        >
          <option value="All">All</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Hard">Hard</option>
          <option value="Short">Short (&lt;10 km)</option>
          <option value="Medium">Medium (10–25 km)</option>
          <option value="Long">Long (&gt;25 km)</option>
        </select>
      </div>

      <TrailTimeline
        trails={filteredTrails}
        onSelectTrail={(trail) => setSelectedTrail(trail)}
        selectedTrail={selectedTrail}
      />

      <div
        style={{
          display: "flex",
          gap: "0px",
          padding: "20px",
          justifyContent: "center",
          alignItems: "stretch",
          height: "calc(100vh - 330px)",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 2, minWidth: "65%", height: "100%" }}>
          <MapView
            trails={filteredTrails}
            selectedTrail={selectedTrail}
            onSelectTrail={(trail) => setSelectedTrail(trail)}
            filter={filter}
          />
        </div>

        {selectedTrail && (
          <div
            style={{
              flex: 1,
              maxWidth: "40%",
              height: "100%",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <TrailDetail key={selectedTrail.id} trail={selectedTrail} />
            {selectedTrail.elevation?.length > 0 && (
              <ElevationChart
                key={selectedTrail.id}
                data={[...selectedTrail.elevation]}
                length={selectedTrail.length}
              />
            )}
            <WeatherInfo lat={selectedTrail.lat} lng={selectedTrail.lng} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
