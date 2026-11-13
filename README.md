# NZ Trails Explorer

NZ Trails Explorer is a React app for browsing hiking trails in New Zealand. It displays trail routes on an interactive map and lets you search and filter trails by name, difficulty, and length. Selecting a trail shows its details, an elevation chart when elevation data is available, and current weather.

Trail information is loaded from the bundled GeoJSON file at `public/assets/nz-full-named-trails.geojson`. The app currently loads up to 300 trails.

## Requirements

- Node.js and npm
- A Google Maps Elevation API key for live elevation data

## Run locally

1. Clone the repository and enter the project directory:

   ```sh
   git clone https://github.com/aryalram/NZ-trails-app.git
   cd NZ-trails-app
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the project root and add your Google Elevation API key:

   ```env
   VITE_GOOGLE_API_KEY=your_google_elevation_api_key
   ```

   Enable the Elevation API for the key and restrict it to the app's required API and development/production referrers. The `.env` file is ignored by Git; do not commit API keys.

4. Start the development server:

   ```sh
   npm run dev
   ```

   Open the local URL printed by Vite (usually `http://localhost:5173`).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Notes

- The bundled trail GeoJSON dataset is large (about 85 MB).
- Elevation data depends on the Google Elevation API. If it is unavailable, the app may show fallback elevation values or omit the chart.
