"""Core analysis: historical forecast selection and accuracy metrics.

The central engineering decision is *which* forecast to compare against each
actual.  We select, for every delivery interval, the latest WINDFOR forecast
published before a configurable decision cutoff on the day before delivery (D-1).
This mirrors what a procurement team would have known when making its day-ahead
buying decision, rather than comparing against the latest forecast available today.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from statistics import mean
from zoneinfo import ZoneInfo

from app.schemas import (
    DEFAULT_CUTOFF_HOUR,
    DEFAULT_CUTOFF_MINUTE,
    IntervalPoint,
)

UK = ZoneInfo("Europe/London")


def half_hourly_intervals(from_date, to_date):
    """Generate every half-hour delivery interval (UTC) between two dates inclusive.

    Intervals are defined in UK local market dates and converted to UTC.  January
    is GMT so local == UTC, but the conversion keeps the logic correct year-round.
    """
    intervals = []
    day = from_date
    while day <= to_date:
        local_start = datetime(day.year, day.month, day.day, tzinfo=UK)
        for period in range(1, 49):
            start_local = local_start + timedelta(minutes=30 * (period - 1))
            intervals.append((period, start_local.astimezone(timezone.utc)))
        day += timedelta(days=1)
    return intervals


def _floor_to_hour(dt: datetime) -> datetime:
    return dt.replace(minute=0, second=0, microsecond=0)

def build_points(
    actuals: dict[datetime, dict],
    forecasts: list[dict],
    from_date,
    to_date,
    cutoff_hour: int = DEFAULT_CUTOFF_HOUR,
    cutoff_minute: int = DEFAULT_CUTOFF_MINUTE,
) -> list[IntervalPoint]:
    """Join actuals and selected forecasts into interval points."""
    intervals = half_hourly_intervals(from_date, to_date)
    chosen = select_forecasts(forecasts, intervals, cutoff_hour, cutoff_minute)
    points: list[IntervalPoint] = []
    for period, start_utc in intervals:
        actual_rec = actuals.get(start_utc)
        forecast_rec = chosen.get(start_utc)

        actual_mw = None
        if actual_rec is not None:
            try:
                actual_mw = float(actual_rec["generation"])
            except (KeyError, TypeError, ValueError):
                actual_mw = None

        forecast_mw = None
        publish_time = None
        if forecast_rec is not None:
            try:
                forecast_mw = float(forecast_rec["generation"])
                publish_time = _parse_ts(forecast_rec["publishTime"])
            except (KeyError, TypeError, ValueError):
                forecast_mw = None
                publish_time = None

        error_mw = None
        matched = False
        if actual_mw is not None and forecast_mw is not None:
            error_mw = forecast_mw - actual_mw
            matched = True

        points.append(
            IntervalPoint(
                startTime=start_utc,
                settlementPeriod=period,
                actualMw=actual_mw,
                forecastMw=forecast_mw,
                forecastPublishTime=publish_time,
                errorMw=error_mw,
                matched=matched,
            )
        )
    return points


def _safe_mape(errors: list[float], actuals: list[float]):
    """Mean absolute percentage error, skipping zero/near-zero actuals."""
    terms = []
    for err, act in zip(errors, actuals):
        if act is None or act == 0:
            continue
        terms.append(abs(err) / abs(act) * 100.0)
    if not terms:
        return None
    return mean(terms)


def compute_metrics(points: list[IntervalPoint]) -> dict:
    matched = [p for p in points if p.matched]
    n = len(matched)
    if n == 0:
        return {
            "matchedIntervals": 0,
            "maeMw": 0.0,
            "rmseMw": 0.0,
            "biasMw": 0.0,
            "mapePercent": None,
            "meanActualMw": 0.0,
            "meanForecastMw": 0.0,
        }
    errors = [p.errorMw for p in matched]
    actuals = [p.actualMw for p in matched]
    forecasts = [p.forecastMw for p in matched]
    mae = mean(abs(e) for e in errors)
    rmse = math.sqrt(mean(e * e for e in errors))
    bias = mean(errors)
    mape = _safe_mape(errors, actuals)
    return {
        "matchedIntervals": n,
        "maeMw": round(mae, 3),
        "rmseMw": round(rmse, 3),
        "biasMw": round(bias, 3),
        "mapePercent": round(mape, 3) if mape is not None else None,
        "meanActualMw": round(mean(actuals), 3),
        "meanForecastMw": round(mean(forecasts), 3),
    }

def _parse_ts(ts: str) -> datetime:
    ts = ts.strip()
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    dt = datetime.fromisoformat(ts)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def select_forecasts(
    forecasts: list[dict],
    intervals,  # list of (settlementPeriod, start_utc)
    cutoff_hour: int = DEFAULT_CUTOFF_HOUR,
    cutoff_minute: int = DEFAULT_CUTOFF_MINUTE,
) -> dict[datetime, dict]:
    """Select the latest eligible forecast for each delivery interval.

    A forecast is eligible for interval ``t`` if:
      * its ``startTime`` is the hour containing ``t`` (WINDFOR is hourly), and
      * it was published on or before the decision cutoff on D-1 (UK local).

    Returns a map from interval start (UTC) to the chosen forecast record
    (or ``None`` when no eligible forecast exists).
    """
    by_hour: dict[datetime, list[dict]] = {}
    for rec in forecasts:
        try:
            start = _parse_ts(rec["startTime"])
            pub = _parse_ts(rec["publishTime"])
        except (KeyError, ValueError):
            continue
        by_hour.setdefault(_floor_to_hour(start), []).append(
            {"publishTime": pub, "record": rec}
        )

    chosen: dict[datetime, dict] = {}
    for _period, start_utc in intervals:
        local_day = start_utc.astimezone(UK).date() - timedelta(days=1)
        cutoff_local = datetime(
            local_day.year, local_day.month, local_day.day,
            cutoff_hour, cutoff_minute, tzinfo=UK,
        )
        cutoff_utc = cutoff_local.astimezone(timezone.utc)

        hour_key = _floor_to_hour(start_utc)
        candidates = by_hour.get(hour_key, [])
        eligible = [c for c in candidates if c["publishTime"] <= cutoff_utc]
        if not eligible:
            chosen[start_utc] = None
            continue
        best = max(eligible, key=lambda c: c["publishTime"])
        chosen[start_utc] = best["record"]
    return chosen
