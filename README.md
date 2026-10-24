# Wind Forecast Intelligence

Day-ahead procurement decision support for the UK electricity market.

A working wind generation forecasting analysis portal that answers two operational
questions for the energy procurement team:

1. **What was the latest wind generation forecast available when we had to make a
   day-ahead buying decision?**
2. **How accurate was that forecast compared with the actual wind generation
   subsequently recorded?**

Analysis period: **January 2026**. Built as an end-to-end engineering challenge
covering data pipeline, analysis, dashboard, Docker packaging, tests, docs, and
deployment.

---

## What the portal shows

| Panel | Purpose |
|-------|---------|
| **KPI strip** | MAE, RMSE, mean bias, MAPE, matched-interval count, data coverage |
| **Actual vs forecast** | Area/line chart of actual wind generation against the selected forecast vintage |
| **Interval-level error** | Bar chart of forecast − actual error per settlement interval |
| **Settlement data table** | Row-level actual / forecast / error / publication timestamp with missing-data indicators; click a row to open its forecast history |
| **Forecast history modal** | Animated pop-up showing every candidate forecast publication for an interval, with the selected vintage highlighted and post-cutoff publications flagged |
| **Accuracy panel** | MAE / RMSE / bias / MAPE as highlighted cards |
| **Methodology panel** | Collapsible explanation of the forecast-vintage selection rule and its assumptions |

The interface is strictly **historical** for January 2026 and never implies that
historical data is a live forecast for future delivery. Publication timestamps
and the selected decision cutoff are shown alongside every result.

---

## Key engineering decision: forecast selection

Comparing actuals with the *latest available* forecast would not represent what
the procurement team knew at decision time. Instead, for each half-hour delivery
interval we select the **latest WINDFOR forecast published before a configurable
decision cutoff on D-1** (the day before delivery). All timestamp comparisons use
timezone-aware datetimes and UK local market dates.

> **Assumption:** the brief does not specify a trading deadline. The default
> cutoff is **11:00 UK local time on D-1**. It is clearly surfaced in the UI and
> configurable via the API (`cutoffHour` / `cutoffMinute`) and environment
> variable (`FORECAST_CUTOFF_HOUR`). It is an assumption, not a verified market
> gate closure.

---

## Architecture

```
frontend/   React + TypeScript + Vite + Recharts + Tailwind + framer-motion
backend/    Python + FastAPI + Pandas + HTTPX
infrastructure Docker + Docker Compose
data source Elexon BMRS (FUELHH actuals, WINDFOR forecasts)
```

- **Backend** — FastAPI app with the Elexon API client, disk caching for
  reproducible local development, historical forecast selection, and accuracy
  metrics (MAE, RMSE, bias, MAPE with zero-actual exclusion). Five validated
  REST endpoints; interactive docs at `/docs`.
- **Frontend** — React dashboard with animated cards (framer-motion), Recharts
  visualisations, a responsive mobile-first layout, and an animated forecast
  history modal triggered from the data table.
- **Caching** — Elexon responses are cached to `.cache/` (gitignored) so the
  pipeline is reproducible without hitting the API on every request.

See `docs/architecture.md` and `docs/methodology.md` for full details.

---

## API contract

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Health and service status |
| `GET /api/overview` | Monthly KPIs and data coverage |
| `GET /api/timeseries` | Actuals and selected forecasts per interval |
| `GET /api/accuracy` | Aggregate error metrics (MAE, RMSE, bias, MAPE) |
| `GET /api/forecasts/history` | Forecast publication history for an interval |

Query parameters: `fromDate`, `toDate` (YYYY-MM-DD), `cutoffHour`,
`cutoffMinute`. Date ranges are validated (from ≤ to, max 92 days).
---

## January 2026 results (default 11:00 D-1 cutoff)

| Metric | Value |
|--------|-------|
| Total half-hour intervals | 1,488 |
| Matched forecast/actual pairs | 1,488 |
| Data coverage | 100% |
| MAE | 2,126 MW |
| RMSE | 2,621 MW |
| Mean bias | +1,840 MW (forecasts tend to overestimate) |
| MAPE | 22.1% |

Figures are computed from the Elexon FUELHH/WINDFOR datasets for January 2026
using the configured default cutoff.

---

## Getting started

### Without Docker

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000

# Frontend (another terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Set `VITE_API_BASE` to point the frontend at your backend.

### With Docker Compose

```bash
docker compose up --build
# Frontend: http://localhost:5173   Backend: http://localhost:8000
```

### One-command helpers

```bash
make up            # start backend + frontend
make test-backend  # run the 11 mocked backend tests
make test-frontend # run the frontend test suite
make build         # build both Docker images
```

---

## Testing

```bash
cd backend && python -m pytest tests/ -q      # 11 tests, all mocked (no network)
cd frontend && npx vitest run                 # frontend tests
```

## Deployment

The frontend builds to static assets and can be hosted independently (e.g.
Vercel). The backend runs on any Python-compatible host. Docker Compose is
validated locally; the serverless hosting configuration is validated separately
because not every platform runs a submitted Docker image.

## Data

Only the Elexon FUELHH and WINDFOR datasets are used. No large raw datasets or
generated data are committed to the repository. See `data/README.md`.

## Documentation

- `docs/architecture.md` — system design, components, data flow, timestamp handling, deployment
- `docs/methodology.md` — forecast selection, joining actuals/forecasts, accuracy metrics, assumptions

## AI disclosure

This repository was produced with the assistance of AI tooling (code generation,
refactoring, and documentation drafting). All engineering decisions — forecast
selection logic, metric definitions, cutoff assumption, and architecture — were
reviewed, adapted, and verified against the Elexon API by the engineer.

