from __future__ import annotations

import argparse
import json
import os

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    roc_auc_score, average_precision_score, brier_score_loss, classification_report
)

from .schemas import FEATURE_COLS, require_feature_cols


def load_json(path: str):
    with open(path, "r") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=str, default="data/synthetic_resumes.csv")
    ap.add_argument("--artifacts", type=str, default="artifacts")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    df = pd.read_csv(args.data)
    require_feature_cols(list(df.columns))

    X = df[FEATURE_COLS].astype(float).copy()
    y_score = df["label_score"].astype(float).values
    y_fraud = df["label_fraud"].astype(int).values

    _, X_test, _, y_score_test, _, y_fraud_test = train_test_split(
        X, y_score, y_fraud,
        test_size=0.2,
        random_state=args.seed,
        stratify=y_fraud
    )

    score_model = joblib.load(os.path.join(args.artifacts, "score_model.pkl"))
    fraud_model = joblib.load(os.path.join(args.artifacts, "fraud_model.pkl"))

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
        "threshold_0_5_report": classification_report(y_fraud_test, (fraud_proba > 0.5).astype(int), output_dict=True),
    }

    metrics = {"score_model": score_metrics, "fraud_model": fraud_metrics}

    metrics_path = os.path.join(args.artifacts, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("Evaluation metrics written to", metrics_path)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()