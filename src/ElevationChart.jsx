import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function ElevationChart({ data, length }) {
  if (!data || data.length === 0) return null;

  const distanceStep =
    length && data.length > 1 ? length / (data.length - 1) : 1;
  const labels = data.map((_, i) => `${(i * distanceStep).toFixed(1)} km`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Elevation (m)",
        data: [...data], // ensure a new reference on change
        borderColor: "#2980b9",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        fill: true,
        pointRadius: 3,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} m`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Distance (km)",
          font: { size: 14 },
        },
      },
      y: {
        title: {
          display: true,
          text: "Elevation (m)",
          font: { size: 14 },
        },
      },
    },
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h4 style={{ marginBottom: "10px", color: "#2c3e50" }}>
        Elevation Profile
      </h4>
      <div
        style={{
          background: "#f9f9f9",
          padding: "16px",
          borderRadius: "10px",
        }}
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default ElevationChart;
