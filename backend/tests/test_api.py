"""API contract tests using FastAPI's TestClient (network calls mocked)."""

from datetime import date, datetime, timedelta, timezone
from unittest import mock

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

FIXED_NOW = datetime(2026, 1, 15, 12, 0, tzinfo=timezone.utc)


def _fake_points(actuals, forecasts, from_date, to_date, cutoff_hour, cutoff_minute):
    from app.schemas import IntervalPoint

    points = []
    day = from_date
    while day <= to_date:
        for period in range(1, 3):
            st = datetime(day.year, day.month, day.day, 0, 30 * (period - 1), tzinfo=timezone.utc)
            points.append(
                IntervalPoint(
                    startTime=st,
                    settlementPeriod=period,
                    actualMw=1000.0,
                    forecastMw=1100.0,
                    forecastPublishTime=FIXED_NOW,
                    errorMw=100.0,
                    matched=True,
                )
            )
        day += timedelta(days=1)
    return points


def _patch_network(monkeypatch):
    monkeypatch.setattr("app.main.fetch_fuelhh_actuals", lambda *a, **k: {})
    monkeypatch.setattr("app.main.fetch_windfor_forecasts", lambda *a, **k: [])
    monkeypatch.setattr("app.main.build_points", _fake_points)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_overview_defaults_to_january(monkeypatch):
    _patch_network(monkeypatch)
    r = client.get("/api/overview")
    assert r.status_code == 200
    body = r.json()
    assert body["period"] == "2026-01-01 to 2026-01-31"
    assert body["totalIntervals"] == 62  # 31 days x 2 periods in fake
    assert body["matchedIntervals"] == 62
    assert body["dataCoveragePercent"] == 100.0


def test_overview_invalid_date_range(monkeypatch):
    _patch_network(monkeypatch)
    r = client.get("/api/overview?fromDate=2026-02-01&toDate=2026-01-01")
    assert r.status_code == 400


def test_overview_range_too_wide(monkeypatch):
    _patch_network(monkeypatch)
    r = client.get("/api/overview?fromDate=2026-01-01&toDate=2026-06-01")
    assert r.status_code == 400


def test_overview_malformed_date(monkeypatch):
    _patch_network(monkeypatch)
    r = client.get("/api/overview?fromDate=not-a-date")
    assert r.status_code == 400


def test_cutoff_is_configurable(monkeypatch):
    _patch_network(monkeypatch)
    r_default = client.get("/api/overview?fromDate=2026-01-10&toDate=2026-01-10")
    r_custom = client.get(
        "/api/overview?fromDate=2026-01-10&toDate=2026-01-10&cutoffHour=14&cutoffMinute=30"
    )
    assert r_default.status_code == 200
    assert r_custom.status_code == 200
    assert r_default.json()["forecastCutoff"] == "11:00 UK (D-1)"
    assert r_custom.json()["forecastCutoff"] == "14:30 UK (D-1)"
