from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple, Any

import numpy as np


# Backend sends camelCase; we keep canonical names here in camelCase to match backend.
FEATURE_COLS: List[str] = [
    "wordCount",
    "skillCount",
    "claimedYears",
    "hasGithub",
    "hasLinks",
    "educationMentions",
    "certMentions",
    "projectCount",
    "avgProjectAgeMonths",
    "timelineGapMonths",
    "contributionCount90d",
    "contributionStreakWeeks",
    "institutionRank",
    "skillConsistency",
]

# Bounds used for simple validation/clipping (not strict, but prevents wild values)
FEATURE_BOUNDS: Dict[str, Tuple[float, float]] = {
    "wordCount": (50, 2000),
    "skillCount": (0, 50),
    "claimedYears": (0, 25),
    "hasGithub": (0, 1),
    "hasLinks": (0, 1),
    "educationMentions": (0, 10),
    "certMentions": (0, 20),
    "projectCount": (0, 50),
    "avgProjectAgeMonths": (0, 240),
    "timelineGapMonths": (0, 120),
    "contributionCount90d": (0, 5000),
    "contributionStreakWeeks": (0, 520),
    "institutionRank": (1, 5),  # 1 best .. 5 worst
    "skillConsistency": (0.0, 1.0),
}


@dataclass(frozen=True)
class FeatureVector:
    """Validated, model-ready feature vector in correct column order."""
    values: np.ndarray

    @staticmethod
    def from_dict(features: Dict[str, Any]) -> "FeatureVector":
        vals = []
        for col in FEATURE_COLS:
            v = features.get(col, 0.0)
            try:
                v = float(v)
            except Exception:
                v = 0.0

            lo, hi = FEATURE_BOUNDS[col]
            if v < lo:
                v = lo
            if v > hi:
                v = hi
            vals.append(v)

        return FeatureVector(values=np.array(vals, dtype=np.float64))

    def to_2d(self) -> np.ndarray:
        return self.values.reshape(1, -1)


def require_feature_cols(df_cols: List[str]) -> None:
    missing = [c for c in FEATURE_COLS if c not in df_cols]
    if missing:
        raise ValueError(f"Dataset missing required feature columns: {missing}")