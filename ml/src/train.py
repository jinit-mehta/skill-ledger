from __future__ import annotations

import argparse
import json
import os
from typing import Dict, Any

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, roc_auc_score, average_precision_score, brier_score_loss

from .schemas import FEATURE_COLS, require_feature_cols


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def train_models(df: pd.DataFrame, seed: int = 42) -> Dict[str, Any]:
    require_feature_cols(list(df.columns))

    X = df[FEATURE_COLS].astype(float).copy()
    y_score = df["label_score"].astype(float).values
    y_fraud = df["label_fraud"].astype(int).values

    X_train, X_test, y_score_train, y_score_test, y_fraud_train, y_fraud_test = train_test_split(
        X, y_score, y_fraud,
        test_size=0.2,
        random_state=seed,
        stratify=y_fraud
    )

    score_model = GradientBoostingRegressor(
        random_state=seed,
        n_estimators=350,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9
    )
    fraud_model = GradientBoostingClassifier(
        random_state=seed,
        n_estimators=350,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9
    )

    score_model.fit(X_train, y_score_train)
    fraud_model.fit(X_train, y_fraud_train)

    # quick metrics on heldout
    pred_score = score_model.predict(X_test)
    score_metrics = {
        "mae": float(mean_absolute_error(y_score_test, pred_score)),
        "rmse": float(mean_squared_error(y_score_test, pred_score) ** 0.5),
        "r2": float(r2_score(y_score_test, pred_score)),
    }

    fraud_proba = fraud_model.predict_proba(X_test)[:, 1]
    fraud_metrics = {
        "roc_auc": float(roc_auc_score(y_fraud_test, fraud_proba)),
        "avg_precision": float(average_precision_score(y_fraud_test, fraud_proba)),
        "brier": float(brier_score_loss(y_fraud_test, fraud_proba)),
        "fraud_rate_test": float(np.mean(y_fraud_test)),
    }

    # medians for explanation baseline
    medians = X_train.median().to_dict()

    return {
        "score_model": score_model,
        "fraud_model": fraud_model,
        "medians": {k: float(v) for k, v in medians.items()},
        "metrics": {
            "score_model": score_metrics,
            "fraud_model": fraud_metrics
        }
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=str, default="data/synthetic_resumes.csv")
    ap.add_argument("--artifacts", type=str, default="artifacts")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    df = pd.read_csv(args.data)

    ensure_dir(args.artifacts)
    out = train_models(df, seed=args.seed)

    joblib.dump(out["score_model"], os.path.join(args.artifacts, "score_model.pkl"))
    joblib.dump(out["fraud_model"], os.path.join(args.artifacts, "fraud_model.pkl"))

    with open(os.path.join(args.artifacts, "feature_cols.json"), "w") as f:
        json.dump(FEATURE_COLS, f, indent=2)

    with open(os.path.join(args.artifacts, "feature_medians.json"), "w") as f:
        json.dump(out["medians"], f, indent=2)

    with open(os.path.join(args.artifacts, "metrics.json"), "w") as f:
        json.dump(out["metrics"], f, indent=2)

    print("Training complete. Artifacts written to:", args.artifacts)
    print(json.dumps(out["metrics"], indent=2))


if __name__ == "__main__":
    main()