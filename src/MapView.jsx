import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Trail calculations
function haversineDistance(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTrailLength(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    total += haversineDistance(
      { lat: lat1, lng: lng1 },
      { lat: lat2, lng: lng2 }
    );
  }
  return Number(total.toFixed(2));
}

function getTrailDifficulty(trail) {
  const length = trail.length || 0;
  const elevation = trail.elevation_gain || 0;
  if (elevation > 300) return "Hard";
  if (elevation > 100) return "Moderate";
  if (length > 25) return "Hard";
  if (length >= 10) return "Moderate";
  return "Easy";
}

function getColorByDifficulty(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "green";
    case "moderate":
      return "blue";
    case "hard":
      return "red";
    default:
      return "gray";
  }
}

// ✅ Safe Leaflet legend using useMap()
function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "topleft" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.style.backgroundColor = "#fff";
      div.style.padding = "10px";
      div.style.borderRadius = "6px";
      div.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
      div.style.fontSize = "12px";
      div.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <div style="width: 20px; height: 4px; background-color: green; margin-right: 8px;"></div>
          <span style="color: black;"> Easy</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <div style="width: 20px; height: 4px; background-color: blue; margin-right: 8px;"></div>
          <span style="color: black;"> Moderate</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 4px; background-color: red; margin-right: 8px;"></div>
          <span style="color: black;">Hard</span>
        </div>
      `;
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
}

function FlyTo({ selectedTrail }) {
  const map = useMap();
  useEffect(() => {
    if (selectedTrail) {
      map.flyTo([selectedTrail.lat, selectedTrail.lng], 10, { duration: 2 });
    }
  }, [selectedTrail, map]);
  return null;
}

function MapView({ trails, selectedTrail, onSelectTrail, filter }) {
  const normalizedFilter = filter?.toLowerCase() || "all";

  const filtered = trails
    .map((trail) => {
      const trailLength =
        trail.length || calculateTrailLength(trail.geometry || []);
      const difficulty = getTrailDifficulty({ ...trail, length: trailLength });
      return { ...trail, length: trailLength, difficulty };
    })
    .filter((trail) => {
      const difficulty = trail.difficulty?.toLowerCase() || "";
      const region = trail.region?.toLowerCase() || "";
      const season = trail.season?.toLowerCase() || "";
      const length = trail.length || 0;

      return (
        normalizedFilter === "all" ||
        difficulty === normalizedFilter ||
        region === normalizedFilter ||
        season === normalizedFilter ||
        (normalizedFilter === "short" && length < 10) ||
        (normalizedFilter === "medium" && length >= 10 && length <= 25) ||
        (normalizedFilter === "long" && length > 25)
      );
    })
    .slice(0, 300);

  return (
    <div
      style={{
        height: "430px",
        width: "100%",
        marginBottom: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <MapContainer
        center={[-41, 173.5]}
        zoom={5.5}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
          maxWidth: "1580px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {filtered.map((trail) => {
          if (!trail.geometry || trail.geometry.length < 2) return null;

          const polylineCoords = trail.geometry.map(([lng, lat]) => [lat, lng]);
          const start = polylineCoords[0];
          const end = polylineCoords[polylineCoords.length - 1];

          return (
            <div key={trail.id}>
              <Polyline
                positions={polylineCoords}
                color={getColorByDifficulty(trail.difficulty)}
                weight={4}
              />
              <Marker position={start}>
                <Popup>
                  <strong>{trail.name}</strong>
                  <br />
                  Start Point
                  <br />
                  📏 {trail.length} km
                  <br />
                  Difficulty: {trail.difficulty}
                  <br />
                  <button onClick={() => onSelectTrail(trail)}>
                    View Details
                  </button>
                </Popup>
              </Marker>
              <Marker position={end}>
                <Popup>
                  <strong>{trail.name}</strong>
                  <br />
                  End Point
                </Popup>
              </Marker>
            </div>
          );
        })}

        <LegendControl />
        <FlyTo selectedTrail={selectedTrail} />
      </MapContainer>
    </div>
  );
}

export default MapView;
