from datetime import date
from typing import Any

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor

app = FastAPI(title="DarshanSetu Crowd Prediction Service", version="1.0.0")


class PredictionRequest(BaseModel):
    templeId: str
    date: date
    historicalData: list[dict[str, Any]] = Field(default_factory=list)
    bookings: int = 0
    dayOfWeek: str = "Monday"
    festival: bool = False
    weather: str = "normal"


class PredictionResponse(BaseModel):
    templeId: str
    predictedVisitors: int
    peakHour: str
    predictedWaitTime: int
    riskLevel: str
    confidence: float


def risk_for(occupancy: float) -> str:
    if occupancy < 50:
        return "LOW"
    if occupancy < 75:
        return "MEDIUM"
    if occupancy < 90:
        return "HIGH"
    return "CRITICAL"


def estimate(request: PredictionRequest) -> int:
    history = [float(item.get("visitorCount", item.get("currentVisitors", 0))) for item in request.historicalData]
    baseline = np.mean(history) if history else 0
    booking_signal = request.bookings * (1.15 if request.festival else 0.85)
    day_factor = 1.2 if request.dayOfWeek in {"Saturday", "Sunday"} else 1.0
    return max(0, round(max(baseline, booking_signal) * day_factor))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    observations = [float(item.get("visitorCount", item.get("currentVisitors", 0))) for item in request.historicalData]
    if len(observations) >= 2:
        features = np.arange(len(observations)).reshape(-1, 1)
        model = RandomForestRegressor(n_estimators=30, random_state=42)
        model.fit(features, observations)
        baseline = float(model.predict([[len(observations)]])[0])
        predicted = round((baseline + estimate(request)) / 2)
        confidence = min(0.95, 0.65 + len(observations) / 100)
    else:
        predicted = estimate(request)
        confidence = 0.55

    capacity = max(10000, predicted)
    occupancy = predicted / capacity * 100
    return PredictionResponse(
        templeId=request.templeId,
        predictedVisitors=predicted,
        peakHour="11:00 AM - 01:00 PM" if request.dayOfWeek in {"Saturday", "Sunday"} else "06:00 PM - 08:00 PM",
        predictedWaitTime=max(15, round(15 + occupancy * 0.55)),
        riskLevel=risk_for(occupancy),
        confidence=round(confidence, 2),
    )
