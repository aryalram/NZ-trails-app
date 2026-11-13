import { useEffect, useState } from "react";

function WeatherInfo({ lat, lng }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchWeather = async () => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=03c4bb00a24829140ff03cf12a05a83b&units=metric`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  if (!weather) return null;

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "10px",
        background: "#4a90e2",
        borderRadius: "8px",
        fontSize: "14px",
      }}
    >
      <strong>Weather Condition Now :</strong>
      <br />
      {weather.name}: {weather.weather[0].main} - temP:{weather.main.temp}°C
      <br />
      Wind: {weather.wind.speed} m/s, Humidity: {weather.main.humidity}%
    </div>
  );
}

export default WeatherInfo;
