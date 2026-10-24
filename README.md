# Wind Forecast Intelligence

Day-ahead procurement decision support for the UK electricity market.

A working wind generation forecasting analysis portal that answers two operational
questions for the energy procurement team:

1. **What was the latest wind generation forecast available when we had to make a
   day-ahead buying decision?**
2. **How accurate was that forecast compared with the actual wind generation
   subsequently recorded?**

Analysis period: **January 2026**. Built as a 16-hour end-to-end engineering
challenge (data pipeline → analysis → dashboard → Docker → deployment → docs).

## Live demo

- Frontend (Vercel): https://wind-forecast-intelligence.vercel.app
- Backend (Python-compatible host): https://wind-forecast-intelligence-api.onrender.com

*(Replace with the actual deployed URLs after step 6 of the execution schedule.)*

## What it shows

- **Forecast monitoring:** latest available forecasts, publication timestamps,
  delivery intervals, and missing-data indicators.
- **Forecast accuracy:** actual vs forecast charts, MAE, RMSE, mean bias, MAPE
  (zero actuals excluded), and interval-level error analysis.
- **Procurement insight:** estimated residual demand after wind generation, with
  a clear warning that this is not a complete procurement requirement.
- **Forecast publication history:** every candidate forecast for an interval,
  with the selected vintage highlighted against the decision cutoff.

## Architecture

```
frontend/   React + TypeScript + Vite + Recharts + Tailwind
backend/    Python + FastAPI + Pandas + HTTPX
infrastructure Docker + Docker Compose
data source Elexon BMRS (FUELHH actuals, WINDFOR forecasts)
```

See `docs/architecture.md` and `docs/methodology.md` for full details.

## Key engineering decision: forecast selection

Comparing actuals with the *latest available* forecast would not represent what
the procurement team knew at decision time. Instead, for each half-hour delivery
interval we select the **latest WINDFOR forecast published before a configurable
decision cutoff on D-1** (the day before delivery). All timestamp comparisons use
timezone-aware datetimes and UK local market dates.

> **Assumption:** the brief does not specify a trading deadline. The default
> cutoff is 11:00 UK local time on D-1. It is clearly surfaced in the UI and
> configurable via the API (`cutoffHour` / `cutoffMinute`) and environment
> variable (`FORECAST_CUTOFF_HOUR`). It is an assumption, not a verified market
> gate closure.

## API contract

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Health and service status |
| `GET /api/overview` | Monthly KPIs and data coverage |
| `GET /api/timeseries` | Actuals and selected forecasts per interval |
| `GET /api/accuracy` | Aggregate error metrics (MAE, RMSE, bias, MAPE) |
| `GET /api/forecasts/history` | Forecast publication history for an interval |

FastAPI's interactive docs are available at `/docs` once the backend is running.

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
and are shown for the configured default cutoff only.

## Repository layout

```
kjhwr/
├── frontend/          React + Vite + TypeScript dashboard
│   ├── src/
│   │   ├── components/   KPI cards, charts, tables, methodology panel
│   │   ├── pages/        Dashboard
│   │   ├── services/     API client
│   │   └── types/        TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── backend/           FastAPI pipeline
│   ├── app/
│   │   ├── api/          FastAPI routes (main.py)
│   │   ├── analytics/    forecast selection + metrics
│   │   ├── services/     Elexon API client
│   │   └── schemas.py    Pydantic contracts
│   ├── tests/            Pytest (11 tests, mocked)
│   ├── Dockerfile
│   └── requirements.txt
├── data/README.md      (no large raw datasets committed)
├── docs/
│   ├── architecture.md
│   └── methodology.md
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

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

## Testing

```bash
cd backend && python -m pytest tests/ -q   # 11 tests, all mocked (no network)
```

## Deployment

The frontend is deployed to Vercel and the backend to a Python-compatible host.
Docker Compose is validated locally; the serverless hosting configuration is
validated separately because not every platform runs a submitted Docker image.

## Data

Only the Elexon FUELHH and WINDFOR datasets are used. No large raw datasets or
generated data are committed to the repository. See `data/README.md`.

## AI disclosure

This repository was produced with the assistance of AI tooling (code generation,
refactoring, and documentation drafting). All engineering decisions — forecast
selection logic, metric definitions, cutoff assumption, and architecture — were
reviewed, adapted, and verified against the Elexon API by the engineer.

## Data methodology

See `docs/methodology.md` for the timestamp handling, forecast selection,
accuracy metric definitions, and zero-actuals handling.
