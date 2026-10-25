"""Elexon BMRS API client for FUELHH (actuals) and WINDFOR (forecasts).

The Elexon dataset stream endpoint is documented at
https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream
and .../datasets/WINDFOR/stream.

Both datasets return JSON records with ``publishTime`` and ``startTime`` timestamps
in UTC.  FUELHH is half-hourly generation outturn by fuel type; WINDFOR contains
wind generation forecasts.

All network access goes through this module so it can be stubbed in tests and so
responses can be cached to disk for reproducible local development.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

BASE_URL = os.environ.get(
    "ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1/datasets"
)

# On Vercel (serverless), only /tmp is writable. Use /tmp/elexon_cache there,
# otherwise default to repo-relative .cache for local/Docker.
_IS_VERCEL = os.environ.get("VERCEL", "").lower() == "1"
_DEFAULT_CACHE = (
    "/tmp/elexon_cache" if _IS_VERCEL else os.path.join(os.path.dirname(__file__), "..", "..", ".cache")
)
CACHE_DIR = os.environ.get("ELEXON_CACHE_DIR", _DEFAULT_CACHE)
REQUEST_TIMEOUT = float(os.environ.get("ELEXON_REQUEST_TIMEOUT", "40"))
ENABLE_CACHE = os.environ.get("ELEXON_ENABLE_CACHE", "1") == "1"
HTTP_VERIFY = os.environ.get("ELEXON_HTTP_VERIFY", "false").lower() != "false"


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse(ts: str) -> datetime:
    """Parse an Elexon ISO-8601 timestamp into a timezone-aware UTC datetime."""
    ts = ts.strip()
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    dt = datetime.fromisoformat(ts)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class ElexonClient:
    def __init__(self, base_url: str = BASE_URL, cache_dir: Optional[str] = None):
        self.base_url = base_url
        self.cache_dir = cache_dir or CACHE_DIR
        self._client = httpx.Client(timeout=REQUEST_TIMEOUT, verify=HTTP_VERIFY)
        if ENABLE_CACHE and self.cache_dir:
            os.makedirs(self.cache_dir, exist_ok=True)

    def _cache_path(self, dataset: str, params: dict) -> Optional[str]:
        if not (ENABLE_CACHE and self.cache_dir):
            return None
        import hashlib

        key = hashlib.sha1(
            json.dumps({"dataset": dataset, "params": params}, sort_keys=True).encode()
        ).hexdigest()
        return os.path.join(self.cache_dir, f"{dataset}_{key}.json")

    def _get_cached(self, path: Optional[str], max_age_seconds: int) -> Optional[list]:
        if not path or not os.path.exists(path):
            return None
        if time.time() - os.path.getmtime(path) > max_age_seconds:
            return None
        try:
            with open(path) as f:
                return json.load(f)
        except (OSError, json.JSONDecodeError):
            return None

    def _save_cache(self, path: Optional[str], data: list) -> None:
        if not path:
            return
        try:
            with open(path, "w") as f:
                json.dump(data, f)
        except OSError:
            pass

    def fetch_dataset(
        self,
        dataset: str,
        from_dt: datetime,
        to_dt: datetime,
        max_age_seconds: int = 3600,
    ) -> list[dict]:
        """Fetch records from a dataset stream within a publish-time window.

        Returns raw JSON records.  Results are cached to disk so the pipeline is
        reproducible and does not hit the Elexon API on every request.
        """
        params = {
            "publishDateTimeFrom": _iso(from_dt),
            "publishDateTimeTo": _iso(to_dt),
        }
        path = self._cache_path(dataset, params)
        cached = self._get_cached(path, max_age_seconds)
        if cached is not None:
            return cached

        url = f"{self.base_url}/{dataset}/stream"
        resp = self._client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        if not isinstance(data, list):
            data = []
        self._save_cache(path, data)
        return data

    def close(self) -> None:
        self._client.close()


def fetch_fuelhh_actuals(
    client: ElexonClient,
    from_dt: datetime,
    to_dt: datetime,
) -> dict[datetime, dict]:
    """Return FUELHH WIND actuals keyed by delivery startTime.

    For each delivery interval the *latest* publish is treated as the final
    outturn (Elexon republishes the same settlement period as data is refined).
    Only records with fuelType == "WIND" are kept.
    """
    raw = client.fetch_dataset("FUELHH", from_dt, to_dt)
    latest: dict[datetime, dict] = {}
    for rec in raw:
        if rec.get("fuelType") != "WIND":
            continue
        start = _parse(rec["startTime"])
        pub = _parse(rec["publishTime"])
        cur = latest.get(start)
        if cur is None or pub > cur[0]:
            latest[start] = (pub, rec)
    return {start: rec for start, (pub, rec) in latest.items()}


def fetch_windfor_forecasts(
    client: ElexonClient,
    from_dt: datetime,
    to_dt: datetime,
) -> list[dict]:
    """Return all WINDFOR forecast records within a publish-time window."""
    return client.fetch_dataset("WINDFOR", from_dt, to_dt)
