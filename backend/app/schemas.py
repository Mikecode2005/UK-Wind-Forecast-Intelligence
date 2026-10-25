"""Pydantic schemas for API request/response contracts."""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "wind-forecast-intelligence"
    version: str = "1.0.0"


class IntervalPoint(BaseModel):
    """A single half-hour delivery interval with actual and selected forecast."""

    startTime: datetime = Field(..., description="Delivery interval start (UTC)")
    settlementPeriod: int = Field(..., description="Elexon settlement period (1-48)")
    actualMw: Optional[float] = Field(None, description="Actual wind generation (MW)")
    forecastMw: Optional[float] = Field(None, description="Selected forecast (MW)")
    forecastPublishTime: Optional[datetime] = Field(
        None, description="When the selected forecast was published"
    )
    errorMw: Optional[float] = Field(None, description="forecast - actual (MW)")
    matched: bool = Field(False, description="Whether both forecast and actual exist")


class OverviewResponse(BaseModel):
    """Monthly KPIs and data coverage."""

    period: str
    totalIntervals: int
    matchedIntervals: int
    unmatchedIntervals: int
    dataCoveragePercent: float
    maeMw: Optional[float] = None
    rmseMw: Optional[float] = None
    biasMw: Optional[float] = None
    mapePercent: Optional[float] = None
    forecastCutoff: str
    cutoffNote: str


class AccuracyResponse(BaseModel):
    """Aggregate forecast accuracy metrics."""

    period: str
    matchedIntervals: int
    maeMw: float
    rmseMw: float
    biasMw: float
    mapePercent: Optional[float]
    meanActualMw: float
    meanForecastMw: float
    intervals: list[IntervalPoint]


class TimeseriesResponse(BaseModel):
    """Actuals and selected forecasts for charting."""

    period: str
    cutoff: str
    points: list[IntervalPoint]


class ForecastHistoryItem(BaseModel):
    """A single candidate forecast publication for an interval."""

    startTime: datetime
    publishTime: datetime
    generationMw: float


class ForecastHistoryResponse(BaseModel):
    """Forecast publication history for selected intervals."""

    intervalStart: datetime
    candidates: list[ForecastHistoryItem]
    selectedPublishTime: Optional[datetime]
    cutoff: datetime


class DataQualityResponse(BaseModel):
    """Data retrieval and matching quality metrics."""

    actualsRetrieved: int
    forecastsRetrieved: int
    matchedIntervals: int
    missingActuals: int
    missingEligibleForecasts: int
    duplicates: int = 0
    invalidValues: int = 0
    excludedAfterCutoff: int
    retrievalTimeMs: int
    sourceStatus: str = "ok"


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


class DateRangeParams(BaseModel):
    """Validated date range for analysis."""

    fromDate: date
    toDate: date

    @model_validator(mode="after")
    def _check_range(self) -> "DateRangeParams":
        if self.toDate < self.fromDate:
            raise ValueError("toDate must be on or after fromDate")
        if (self.toDate - self.fromDate).days > 92:
            raise ValueError("date range must not exceed 92 days")
        return self


DEFAULT_CUTOFF_HOUR = 11
DEFAULT_CUTOFF_MINUTE = 0
"""Default decision cutoff: 11:00 UK local time on D-1.

This is a modelling assumption. The brief does not specify a trading deadline, so
the cutoff is configurable and clearly surfaced in the UI as an assumption rather
than a verified market gate closure.
"""

DEFAULT_PERIOD = "2026-01-01 to 2026-01-31"
