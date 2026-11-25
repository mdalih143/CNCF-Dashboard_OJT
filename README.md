# CNCF Project Adoption Metrics Dashboard
Dark-themed analytics dashboard for CNCF projects: dashboard, explorer, analytics charts, comparison and monitoring.

## Run on Windows
1. Install Node.js LTS (18+) from https://nodejs.org.
2. Unzip this folder, open it in PowerShell (Shift+right-click > "Open PowerShell window here").
3. Run `npm start` (no `npm install` needed: zero dependencies, Chart.js is bundled in `public/vendor`).
4. Open http://localhost:3000. Use `$env:PORT=4000; npm start` for another port.
5. Optional: `npm test` runs the API and statistics checks.

## Structure
- `server.js` HTTP server and API: `/api/health`, `/api/meta`, `/api/stats`, `/api/projects` (query: `q, category, maturity, sort, order`), `/api/projects/:name`
- `data/projects.json` dataset (edit or regenerate with `python scripts/build-data.py`)
- `public/` frontend (`index.html`, `styles.css`, `app.js`, `vendor/chart.umd.js`)
- `test.js` automated API tests

## Data honesty
Star, contributor and release counts are **approximate hand-curated figures, not live GitHub data**, and the UI says so. The adoption score is 50% stars + 30% contributors + 20% releases, each normalised to the maximum. The Monitoring page separates verified live server metrics from snapshot data. To add projects, add a row in `scripts/build-data.py` (or an object in `projects.json`) and refresh.
