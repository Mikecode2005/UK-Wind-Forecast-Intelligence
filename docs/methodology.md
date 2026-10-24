# Data methodology

## Datasets (Elexon BMRS only)

- **FUELHH** — actual generation by fuel type, half-hourly. We use the `WIND`
  fuel type records. Each record carries `publishTime`, `startTime`,
  `settlementDate`, `settlementPeriod`, and `generation` (MW).
- **WINDFOR** — wind generation forecasts. Each record carries `publishTime`,
  `startTime`, and `generation` (MW). In the supplied data `startTime` is hourly
  (minute `:00`); FUELHH is half-hourly (`:00`/`:30`).

## Forecast selection logic

For every half-hour delivery interval `t` in the analysis window:

1. Determine the decision day = delivery date − 1 (D-1) in UK local time.
2. Compute the decision cutoff on D-1 (default 11:00 UK, configurable).
3. Consider WINDFOR forecasts whose `startTime` hour contains `t` and whose
   `publishTime` is on or before the cutoff.
4. Select the eligible forecast with the latest `publishTime`.
5. If no eligible forecast exists, the interval is flagged unmatched.

This mirrors the information available to the procurement team at day-ahead
decision time. It deliberately avoids comparing against the latest forecast
available today.

## Joining actuals and forecasts

- FUELHH republishes settlement periods as data is refined; for each delivery
  `startTime` we keep the **latest publish** as the final actual outturn.
- WINDFOR forecasts are hourly; each forecast is applied to both half-hour
  periods within its hour.
- Actuals and selected forecasts are joined on exact delivery `startTime`.
- Intervals missing a forecast or an actual are reported as unmatched so
  incomplete data never inflates apparent accuracy.

## Accuracy metrics (over matched pairs)

- **MAE** = mean(|forecast − actual|) in MW.
- **RMSE** = sqrt(mean((forecast − actual)²)) — penalises large errors.
- **Mean bias** = mean(forecast − actual) — positive = overestimation.
- **MAPE** = mean(|error| / actual × 100), excluding intervals where actual == 0
  (zero and near-zero actuals handled explicitly; division by zero avoided).
- **Coverage** = matched intervals / total expected intervals.

January 2026 has 31 days × 48 half-hour periods = 1,488 expected intervals.

## Historical vs current

The interface is strictly historical for January 2026. It does not imply that
historical data is a live forecast for future delivery. Publication timestamps
and the selected decision cutoff are shown alongside every result so the vintage
of each forecast is transparent.

## Assumptions and limitations

- The decision cutoff is unspecified by the brief; 11:00 UK on D-1 is a modelling
  assumption, clearly labelled as such and configurable.
- WINDFOR is hourly in the supplied data; forecasts are applied to both half-hour
  periods of their hour.
- Estimated residual demand (demand − wind) is shown for context only and is not
  a complete procurement requirement (other generation, demand forecasts, and
  market positions are outside scope).
