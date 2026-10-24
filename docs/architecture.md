# Architecture

## Overview

Wind Forecast Intelligence is a three-tier application:

- **Frontend** — React, TypeScript, Vite, Recharts, Tailwind. Runs in the browser
  and calls the backend REST API. Deployable independently (e.g. Vercel).
- **Backend** — Python, FastAPI, Pandas, HTTPX. Implements the Elexon API client,
  historical forecast selection, and accuracy metrics. Deployable on any
  Python-compatible host.
- **Data source** — Elexon BMRS `FUELHH` (actual generation by fuel type, half-hourly)
  and `WINDFOR` (wind generation forecasts, with publishTime/startTime).

## Components

### Backend (`backend/app`)

- `main.py` — FastAPI app, CORS, request validation, five REST endpoints.
- `services/elexon.py` — HTTP client for the Elexon dataset stream endpoint with
  disk caching for reproducible local development. All timestamps parsed as
  timezone-aware UTC datetimes.
- `analytics/analysis.py` — Forecast selection logic and accuracy metrics
  (MAE, RMSE, bias, MAPE with zero-actual exclusion).
- `schemas.py` — Pydantic request/response contracts and the cutoff assumption
  documentation.
- `tests/` — Pytest suite (mocked, no network).

### Frontend (`frontend/src`)

- `services/api.ts` — Fetch-based API client keyed off `VITE_API_BASE`.
- `components/` — KPI cards, actual-vs-forecast chart (Recharts), settlement
  data table, accuracy panel, methodology panel, filter bar.
- `pages/Dashboard.tsx` — Orchestrates data loading and displays all panels.

## Data flow

1. Frontend requests a date range + cutoff from the backend.
2. Backend fetches FUELHH (actuals) and WINDFOR (forecasts) from Elexon for a
   publish-time window covering the analysis period.
3. For each half-hour delivery interval, the backend selects the latest WINDFOR
   forecast published before the D-1 cutoff whose `startTime` hour contains the
   interval (WINDFOR is hourly; FUELHH is half-hourly).
4. Actuals and selected forecasts are joined on delivery timestamp; accuracy
   metrics are computed over matched pairs; unmatched intervals are reported.
5. Frontend renders KPIs, chart, table, and methodology notes.

## Timestamp handling

All timestamps are timezone-aware. Delivery dates are UK local market dates
(`Europe/London`) converted to UTC for comparison with Elexon's UTC timestamps.
January is GMT, so local == UTC, but the conversion keeps the logic correct
across DST boundaries.

## Deployment

- `docker-compose.yml` runs backend + frontend locally.
- Frontend is built as static assets and served independently (Vercel).
- Backend runs as a Python service (Render/Railway/etc.).
- Docker Compose is validated locally; the serverless hosting configuration is
  validated separately because not every platform runs a submitted Docker image.

## Security notes

- `ELEXON_HTTP_VERIFY` controls TLS verification of the Elexon API. Defaults to
  `true`; set to `false` only in isolated/local environments where the Python
  SSL store cannot verify the upstream certificate.
- CORS is permissive (`allow_origins=["*"]`) for development; restrict in
  production.
