"""Unit tests for the analysis engine using synthetic data (no network)."""

from datetime import date, datetime, timedelta, timezone

from app.analytics.analysis import build_points, compute_metrics, select_forecasts


def _rec(publish, start, gen=1000.0):
    return {
        "publishTime": publish.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "startTime": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "generation": gen,
    }


def test_select_forecasts_picks_latest_before_cutoff():
    # Delivery: 2026-01-15 08:00. Cutoff 11:00 on D-1 (2026-01-14).
    forecasts = [
        _rec(datetime(2026, 1, 14, 9, 30), datetime(2026, 1, 15, 8, 0), 1000),
        _rec(datetime(2026, 1, 14, 11, 30), datetime(2026, 1, 15, 8, 0), 2000),  # after cutoff
        _rec(datetime(2026, 1, 14, 4, 30), datetime(2026, 1, 15, 8, 0), 500),
    ]
    intervals = [(16, datetime(2026, 1, 15, 8, 0, tzinfo=timezone.utc))]
    chosen = select_forecasts(forecasts, intervals, cutoff_hour=11, cutoff_minute=0)
    sel = chosen[intervals[0][1]]
    assert sel is not None
    assert sel["generation"] == 1000  # 09:30 is latest before 11:00


def test_select_forecasts_none_when_all_after_cutoff():
    forecasts = [
        _rec(datetime(2026, 1, 14, 11, 30), datetime(2026, 1, 15, 8, 0), 2000),
    ]
    intervals = [(16, datetime(2026, 1, 15, 8, 0, tzinfo=timezone.utc))]
    chosen = select_forecasts(forecasts, intervals, cutoff_hour=11, cutoff_minute=0)
    assert chosen[intervals[0][1]] is None


def test_compute_metrics_basic():
    from app.schemas import IntervalPoint

    points = [
        IntervalPoint(
            startTime=datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc),
            settlementPeriod=1,
            actualMw=1000.0,
            forecastMw=1100.0,
            errorMw=100.0,
            matched=True,
        ),
        IntervalPoint(
            startTime=datetime(2026, 1, 1, 0, 30, tzinfo=timezone.utc),
            settlementPeriod=2,
            actualMw=1000.0,
            forecastMw=900.0,
            errorMw=-100.0,
            matched=True,
        ),
        IntervalPoint(
            startTime=datetime(2026, 1, 1, 1, 0, tzinfo=timezone.utc),
            settlementPeriod=3,
            actualMw=None,
            forecastMw=500.0,
            errorMw=None,
            matched=False,
        ),
    ]
    m = compute_metrics(points)
    assert m["matchedIntervals"] == 2
    assert m["maeMw"] == 100.0
    assert m["rmseMw"] == 100.0
    assert m["biasMw"] == 0.0
    assert m["mapePercent"] == 10.0


def test_compute_metrics_handles_zero_actual_mape():
    from app.schemas import IntervalPoint

    points = [
        IntervalPoint(
            startTime=datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc),
            settlementPeriod=1,
            actualMw=0.0,
            forecastMw=100.0,
            errorMw=100.0,
            matched=True,
        ),
        IntervalPoint(
            startTime=datetime(2026, 1, 1, 0, 30, tzinfo=timezone.utc),
            settlementPeriod=2,
            actualMw=1000.0,
            forecastMw=1000.0,
            errorMw=0.0,
            matched=True,
        ),
    ]
    m = compute_metrics(points)
    assert m["matchedIntervals"] == 2
    assert m["mapePercent"] == 0.0  # zero-actual interval excluded from MAPE


def test_build_points_marks_unmatched():
    actuals = {}  # no actuals at all
    forecasts = [
        _rec(datetime(2026, 1, 14, 9, 30), datetime(2026, 1, 15, 8, 0), 1000),
    ]
    points = build_points(
        actuals, forecasts, date(2026, 1, 15), date(2026, 1, 15)
    )
    # interval at 08:00 has a forecast but no actual -> unmatched
    p8 = [p for p in points if p.startTime.hour == 8 and p.startTime.minute == 0][0]
    assert p8.matched is False
    assert p8.forecastMw == 1000.0
    assert p8.actualMw is None
