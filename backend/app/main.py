"""FastAPI backend for the Wind Forecast Intelligence portal.

Endpoints:
  GET /api/health
  GET /api/overview          monthly KPIs + data coverage
  GET /api/timeseries        actuals + selected forecasts per interval
  GET /api/accuracy          aggregate error metrics
  GET /api/forecasts/history forecast publication history for an interval
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.analytics.analysis import build_points, compute_metrics
from app.schemas import (
    AccuracyResponse,
    DateRangeParams,
    ForecastHistoryResponse,
    ForecastHistoryItem,
    HealthResponse,
    OverviewResponse,
    TimeseriesResponse,
    DEFAULT_CUTOFF_HOUR,
    DEFAULT_CUTOFF_MINUTE,
)
from app.services.elexon import ElexonClient, fetch_fuelhh_actuals, fetch_windfor_forecasts

app = FastAPI(title="Wind Forecast Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_client = ElexonClient()
UK = ZoneInfo("Europe/London")


def _default_range() -> tuple[date, date]:
    """Default analysis period: January 2026."""
    return date(2026, 1, 1), date(2026, 1, 31)


def _parse_date(val: Optional[str], default: date) -> date:
    if val is None:
        return default
    try:
        return date.fromisoformat(val)
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail=f"Invalid date '{val}': use YYYY-MM-DD"
        ) from exc


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    return HealthResponse()


def _load_analysis(from_date: date, to_date: date, cutoff_hour: int, cutoff_minute: int):
    """Fetch raw data and build interval points for a date range.

    FUELHH actuals are pulled for a publish window covering the analysis month plus
    one day either side so late republications are captured.  WINDFOR forecasts are
    pulled over the same window.
    """
    fetch_from = datetime(from_date.year, from_date.month, from_date.day) - timedelta(days=1)
    fetch_to = datetime(to_date.year, to_date.month, to_date.day) + timedelta(days=2)

    actuals = fetch_fuelhh_actuals(_client, fetch_from, fetch_to)
    forecasts = fetch_windfor_forecasts(_client, fetch_from, fetch_to)
    points = build_points(actuals, forecasts, from_date, to_date, cutoff_hour, cutoff_minute)
    return points, actuals, forecasts


@app.get("/api/overview", response_model=OverviewResponse, tags=["analysis"])
def overview(
    fromDate: Optional[str] = Query(None),
    toDate: Optional[str] = Query(None),
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59),
) -> OverviewResponse:
    f_date = _parse_date(fromDate, _default_range()[0])
    t_date = _parse_date(toDate, _default_range()[1])
    try:
        DateRangeParams(fromDate=f_date, toDate=t_date)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    points, _actuals, _forecasts = _load_analysis(f_date, t_date, cutoffHour, cutoffMinute)
    total = len(points)
    matched = [p for p in points if p.matched]
    coverage = (len(matched) / total * 100) if total else 0.0
    metrics = compute_metrics(points)

    from_label, to_label = f_date.isoformat(), t_date.isoformat()
    return OverviewResponse(
        period=f"{from_label} to {to_label}",
        totalIntervals=total,
        matchedIntervals=len(matched),
        unmatchedIntervals=total - len(matched),
        dataCoveragePercent=round(coverage, 2),
        maeMw=metrics["maeMw"],
        rmseMw=metrics["rmseMw"],
        biasMw=metrics["biasMw"],
        mapePercent=metrics["mapePercent"],
        forecastCutoff=f"{cutoffHour:02d}:{cutoffMinute:02d} UK (D-1)",
        cutoffNote=(
            "Forecasts are selected as the latest publication before the configured "
            "cutoff on the day before delivery. The default 11:00 cutoff is a modelling "
            "assumption, not a verified trading deadline."
        ),
    )


@app.get("/api/timeseries", response_model=TimeseriesResponse, tags=["analysis"])
def timeseries(
    fromDate: Optional[str] = Query(None),
    toDate: Optional[str] = Query(None),
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59),
) -> TimeseriesResponse:
    f_date = _parse_date(fromDate, _default_range()[0])
    t_date = _parse_date(toDate, _default_range()[1])
    try:
        DateRangeParams(fromDate=f_date, toDate=t_date)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    points, _actuals, _forecasts = _load_analysis(f_date, t_date, cutoffHour, cutoffMinute)
    from_label, to_label = f_date.isoformat(), t_date.isoformat()
    return TimeseriesResponse(
        period=f"{from_label} to {to_label}",
        cutoff=f"{cutoffHour:02d}:{cutoffMinute:02d} UK (D-1)",
        points=points,
    )


@app.get("/api/accuracy", response_model=AccuracyResponse, tags=["analysis"])
def accuracy(
    fromDate: Optional[str] = Query(None),
    toDate: Optional[str] = Query(None),
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59),
) -> AccuracyResponse:
    f_date = _parse_date(fromDate, _default_range()[0])
    t_date = _parse_date(toDate, _default_range()[1])
    try:
        DateRangeParams(fromDate=f_date, toDate=t_date)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    points, _actuals, _forecasts = _load_analysis(f_date, t_date, cutoffHour, cutoffMinute)
    metrics = compute_metrics(points)
    matched = [p for p in points if p.matched]
    from_label, to_label = f_date.isoformat(), t_date.isoformat()
    return AccuracyResponse(
        period=f"{from_label} to {to_label}",
        matchedIntervals=metrics["matchedIntervals"],
        maeMw=metrics["maeMw"],
        rmseMw=metrics["rmseMw"],
        biasMw=metrics["biasMw"],
        mapePercent=metrics["mapePercent"],
        meanActualMw=metrics["meanActualMw"],
        meanForecastMw=metrics["meanForecastMw"],
        intervals=matched,
    )


@app.get("/api/forecasts/history", response_model=ForecastHistoryResponse, tags=["analysis"])
def forecast_history(
    intervalStart: str = Query(..., description="Delivery interval start (ISO-8601 UTC)"),
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59),
) -> ForecastHistoryResponse:
    """Return every candidate forecast publication for the hour containing the
    requested interval, flagging which one was selected under the cutoff rule."""
    try:
        start_utc = datetime.fromisoformat(intervalStart.replace("Z", "+00:00"))
        if start_utc.tzinfo is None:
            start_utc = start_utc.replace(tzinfo=timezone.utc)
        start_utc = start_utc.astimezone(timezone.utc)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid intervalStart: {exc}")

    fetch_from = datetime(2026, 1, 1) - timedelta(days=2)
    fetch_to = datetime(2026, 2, 1) + timedelta(days=2)
    forecasts = fetch_windfor_forecasts(_client, fetch_from, fetch_to)

    hour_key = start_utc.replace(minute=0, second=0, microsecond=0)
    candidates = []
    for rec in forecasts:
        try:
            st = datetime.fromisoformat(rec["startTime"].replace("Z", "+00:00")).astimezone(timezone.utc)
            pub = datetime.fromisoformat(rec["publishTime"].replace("Z", "+00:00")).astimezone(timezone.utc)
        except (KeyError, ValueError):
            continue
        if st != hour_key:
            continue
        candidates.append(
            ForecastHistoryItem(
                startTime=st,
                publishTime=pub,
                generationMw=float(rec["generation"]),
            )
        )
    candidates.sort(key=lambda c: c.publishTime)

    local_day = start_utc.date() - timedelta(days=1)
    cutoff_local = datetime(
        local_day.year, local_day.month, local_day.day,
        cutoffHour, cutoffMinute, tzinfo=UK,
    ).astimezone(timezone.utc)

    eligible = [c for c in candidates if c.publishTime <= cutoff_local]
    selected = max(eligible, key=lambda c: c.publishTime) if eligible else None

    return ForecastHistoryResponse(
        intervalStart=start_utc,
        candidates=candidates,
        selectedPublishTime=selected.publishTime if selected else None,
        cutoff=cutoff_local,
    )
