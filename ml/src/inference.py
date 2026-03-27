from __future__ import annotations

import json
import os
from typing import Dict, Any, List, Tuple

import joblib
import numpy as np
import pandas as pd

from .schemas import FEATURE_COLS, FeatureVector


class InferenceEngine:
    def __init__(self, artifacts_dir: str):
        self.artifacts_dir = artifacts_dir
        self.score_model = joblib.load(os.path.join(artifacts_dir, "score_model.pkl"))
        self.fraud_model = joblib.load(os.path.join(artifacts_dir, "fraud_model.pkl"))

        with open(os.path.join(artifacts_dir, "feature_cols.json"), "r") as f:
            cols = json.load(f)
        if cols != FEATURE_COLS:
            # Don't hard fail; but this is a strong warning that backend/features mismatch.
            raise ValueError(f"feature_cols.json mismatch.\nExpected: {FEATURE_COLS}\nGot: {cols}")

        with open(os.path.join(artifacts_dir, "feature_medians.json"), "r") as f:
            self.medians = {k: float(v) for k, v in json.load(f).items()}

        self._median_vec = np.array([self.medians[c] for c in FEATURE_COLS], dtype=np.float64)

    def _predict_score(self, fv: FeatureVector) -> float:
        return float(self.score_model.predict(fv.to_2d())[0])

    def _predict_fraud_prob(self, fv: FeatureVector) -> float:
        return float(self.fraud_model.predict_proba(fv.to_2d())[0, 1])

    def explain(self, fv: FeatureVector, topk: int = 6) -> List[Dict[str, float]]:
        """
        Median-ablation explanation:
          impact(feature) = pred(original) - pred(with feature replaced by train median)
        Positive impact means this feature increased the score compared to typical median value.
        """
        base = self._predict_score(fv)
        impacts: List[Tuple[str, float]] = []

        # Build once
        x = fv.values.copy()
        for idx, col in enumerate(FEATURE_COLS):
            x2 = x.copy()
            x2[idx] = self._median_vec[idx]
            p2 = float(self.score_model.predict(x2.reshape(1, -1))[0])
            impacts.append((col, base - p2))

        impacts.sort(key=lambda t: abs(t[1]), reverse=True)
        return [{"feature": f, "impact": float(imp)} for f, imp in impacts[:topk]]

    def score_resume(self, features: Dict[str, Any]) -> Dict[str, Any]:
        fv = FeatureVector.from_dict(features)
        ml_score = self._predict_score(fv)               # 0..100-ish
        fraud_prob = self._predict_fraud_prob(fv)        # 0..1

        # Deterministic adjustment rule (explainable)
        # Penalize up to 60% of the score at fraud_prob=1.0
        multiplier = float(np.clip(1.0 - 0.60 * fraud_prob, 0.0, 1.0))
        final_score = float(np.clip(ml_score * multiplier, 0.0, 100.0))

        explanation = {
            "adjustment": {
                "rule": "final_score = ml_score * (1 - 0.60 * fraud_prob)",
                "multiplier": multiplier
            },
            "top_drivers": self.explain(fv, topk=6),
            "feature_values": {k: float(v) for k, v in zip(FEATURE_COLS, fv.values.tolist())}
        }

        return {
            "ml_score": float(ml_score),
            "fraud_prob": float(fraud_prob),
            "final_score": float(final_score),
            "explanation": explanation
        }