from __future__ import annotations

import argparse
from dataclasses import dataclass
from typing import Dict, Any, List

import numpy as np
import pandas as pd
from faker import Faker
from tqdm import tqdm

from .schemas import FEATURE_COLS

fake = Faker()


@dataclass
class GenConfig:
    seed: int = 42
    n: int = 20000


def _clip(x: float, lo: float, hi: float) -> float:
    return float(max(lo, min(hi, x)))


def generate_one(rng: np.random.Generator) -> Dict[str, Any]:
    """
    Latent variables:
      - skill_depth: real capability
      - project_quality: project impact/credibility
      - discipline: consistency of timeline/claims
      - honesty: probability of not being fraudulent
      - institution_rank: 1..5 (1 best)
    Fraud patterns:
      - inflated years/projects/skills
      - larger unexplained timeline gaps
      - low skillConsistency (many skills but thin evidence)
      - high links but low credible contribution density
    """

    skill_depth = rng.beta(2.2, 2.2)             # 0..1
    project_quality = rng.beta(2.0, 2.2)         # 0..1
    discipline = rng.beta(2.2, 1.8)              # 0..1
    honesty = rng.beta(3.0, 1.4)                 # 0..1
    institution_rank = int(rng.integers(1, 6))   # 1..5

    fraud = 1 if rng.random() > honesty else 0

    # Resume length correlates with skill depth a bit, but has noise
    word_count = _clip(rng.normal(450 + 500 * skill_depth, 180), 80, 1800)

    # Skills: true skill count, plus fraud inflation
    true_skill_count = int(_clip(rng.normal(5 + 10 * skill_depth, 2.5), 0, 35))
    skill_inflation = rng.uniform(0.15, 1.0) if fraud else 0.0
    skill_count = int(_clip(true_skill_count * (1.0 + 0.7 * skill_inflation), 0, 50))

    # Claimed years vs plausible years
    years_true = _clip(rng.normal(1.0 + 10.0 * skill_depth, 2.0), 0, 18)
    claimed_years = _clip(years_true * (1.0 + (0.4 + skill_inflation) if fraud else 1.0), 0, 25)

    # Projects and project age
    project_count_true = int(_clip(rng.poisson(1 + 7 * project_quality), 0, 30))
    project_count = int(_clip(project_count_true * (1.0 + (0.5 * skill_inflation if fraud else 0.0)), 0, 50))

    # If projects are credible, avg age tends to be older (longer history)
    avg_project_age_months = _clip(
        rng.normal(8 + 30 * project_quality + 10 * skill_depth, 10),
        0, 240
    )
    if fraud:
        # Fraud often invents recent projects
        avg_project_age_months = _clip(avg_project_age_months - rng.uniform(5, 20), 0, 240)

    # Timeline gaps
    gap_base = _clip(rng.normal(1 + 10 * (1 - discipline), 5), 0, 60)
    timeline_gap_months = gap_base
    if fraud:
        timeline_gap_months = _clip(timeline_gap_months + rng.uniform(6, 30), 0, 120)

    # Links signals
    has_links = 1 if rng.random() < _clip(0.35 + 0.4 * skill_depth + 0.2 * project_quality, 0.0, 1.0) else 0
    has_github = 1 if rng.random() < _clip(0.25 + 0.55 * skill_depth, 0.0, 1.0) else 0
    if fraud and rng.random() < 0.2:
        # Some fraud adds links/github to appear legit
        has_links = 1
        has_github = 1

    # Education/certs mentions: noisy
    education_mentions = int(_clip(rng.poisson(1 + (6 - institution_rank) * 0.25), 0, 10))
    cert_mentions = int(_clip(rng.poisson(0.6 + 1.8 * skill_depth), 0, 20))
    if fraud:
        cert_mentions = int(_clip(cert_mentions + rng.integers(0, 3), 0, 20))

    # Contributions in last 90 days + streak
    contribution_count90d = int(_clip(rng.poisson(5 + 80 * skill_depth + 30 * project_quality), 0, 5000))
    contribution_streak_weeks = int(_clip(rng.poisson(1 + 10 * skill_depth), 0, 520))
    if has_github == 0:
        contribution_count90d = int(_clip(contribution_count90d * 0.2, 0, 5000))
        contribution_streak_weeks = int(_clip(contribution_streak_weeks * 0.3, 0, 520))

    # Skill consistency: how well skills align with projects and contributions
    # High when deep + contributions + projects. Penalize when skill_count inflated without evidence.
    evidence = np.tanh((contribution_count90d / 60.0) + (project_count / 8.0) + (claimed_years / 8.0))
    claimed_pressure = np.tanh(skill_count / 12.0)
    skill_consistency = _clip(0.15 + 0.75 * evidence - 0.35 * claimed_pressure + 0.25 * skill_depth, 0.0, 1.0)
    if fraud:
        skill_consistency = _clip(skill_consistency - rng.uniform(0.05, 0.35), 0.0, 1.0)

    # Targets
    inst_score = (6 - institution_rank) / 5.0  # 1.0 best to 0.2 worst

    # Base score before fraud penalty (0..100)
    score_base = (
        20 * np.tanh(word_count / 700.0) +
        18 * (skill_depth) +
        16 * (project_quality) +
        10 * inst_score +
        12 * np.tanh(contribution_count90d / 120.0) +
        6 * np.tanh(contribution_streak_weeks / 10.0) +
        10 * skill_consistency +
        6 * (1.0 - np.tanh(timeline_gap_months / 18.0)) +
        2 * has_github +
        0.5 * has_links
    )
    score_base = float(_clip(score_base, 0, 100))

    # Observed label: penalize fraud and inconsistency
    fraud_penalty = 18.0 if fraud else 0.0
    incons_penalty = 12.0 * (1.0 - skill_consistency) + 8.0 * np.tanh(timeline_gap_months / 24.0)

    label_score = float(_clip(score_base - fraud_penalty - incons_penalty, 0, 100))
    label_fraud = int(fraud)

    row = {
        "wordCount": float(word_count),
        "skillCount": float(skill_count),
        "claimedYears": float(claimed_years),
        "hasGithub": float(has_github),
        "hasLinks": float(has_links),
        "educationMentions": float(education_mentions),
        "certMentions": float(cert_mentions),
        "projectCount": float(project_count),
        "avgProjectAgeMonths": float(avg_project_age_months),
        "timelineGapMonths": float(timeline_gap_months),
        "contributionCount90d": float(contribution_count90d),
        "contributionStreakWeeks": float(contribution_streak_weeks),
        "institutionRank": float(institution_rank),
        "skillConsistency": float(skill_consistency),
        "label_score": label_score,
        "label_fraud": label_fraud,
    }

    # Ensure we didn't miss/typo feature columns
    for c in FEATURE_COLS:
        if c not in row:
            raise RuntimeError(f"Missing feature {c} in generator row")

    return row


def make_dataset(cfg: GenConfig) -> pd.DataFrame:
    rng = np.random.default_rng(cfg.seed)
    rows: List[Dict[str, Any]] = []
    for _ in tqdm(range(cfg.n), desc="Generating synthetic resumes"):
        rows.append(generate_one(rng))
    return pd.DataFrame(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=str, default="data/synthetic_resumes.csv")
    ap.add_argument("--n", type=int, default=20000)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    df = make_dataset(GenConfig(seed=args.seed, n=args.n))
    df.to_csv(args.out, index=False)
    print(f"Wrote {len(df)} rows to {args.out}")
    print(df.head())


if __name__ == "__main__":
    main()