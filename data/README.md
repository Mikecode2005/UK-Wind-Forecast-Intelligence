# Data

This directory is intentionally empty of raw datasets.

The application fetches data live from the Elexon BMRS API:

- `FUELHH` — actual generation by fuel type (half-hourly)
- `WINDFOR` — wind generation forecasts

No large raw datasets or generated data are committed to this repository. The
backend caches fetched responses to `.cache/` (gitignored) for reproducible local
development; that cache is not part of the submission.

## Analysis period

January 2026 (31 days × 48 half-hour periods = 1,488 expected intervals).

## Provenance

All data is supplied by Elexon (https://data.elexon.co.uk / bmrs.elexon.co.uk).
Dataset documentation:
- https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream
- https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream
