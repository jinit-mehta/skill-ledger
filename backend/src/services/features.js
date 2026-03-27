// Produces ML feature keys (camelCase) matching ml/src/schemas.py
// Missing "hard" signals are inferred roughly or defaulted.

export const SKILLS = [
  "javascript", "typescript", "react", "node", "solidity", "python", "pandas", "numpy",
  "scikit-learn", "mongodb", "postgres", "aws", "docker", "kubernetes", "git", "linux"
];

function countRegex(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function maxNumberFromPattern(text, re) {
  const matches = [...text.matchAll(re)];
  if (!matches.length) return 0;
  return Math.max(...matches.map(m => Number(m[1] || 0)).filter(n => Number.isFinite(n)));
}

export function extractFeaturesFromResumeText(text) {
  const t = (text || "").toLowerCase();

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const matches = SKILLS.filter(s => t.includes(s));
  const skillCount = matches.length;

  // claimedYears: detect "X years" or "X yrs"
  const claimedYearsRaw = maxNumberFromPattern(t, /(\d+)\+?\s*(years|yrs)\b/g);
  // Default to 2 years if no specific year count found but "experience" is mentioned, to avoid 0 score
  const claimedYears = claimedYearsRaw > 0 ? Math.min(25, claimedYearsRaw) : (t.includes("experience") ? 2 : 0);

  const hasGithub = /github\.com\/[a-z0-9_.-]+/i.test(text) ? 1 : 0;
  const hasLinks = /(https?:\/\/)/i.test(text) ? 1 : 0;

  const educationMentions = countRegex(t, /(b\.?tech|bachelor|master|phd|university|college|school|institute)/g);
  const certMentions = countRegex(t, /(certificat|coursera|udemy|edx|linkedIn learning|bootcamp)/g);

  // projectCount heuristic: count occurrences of "project" and cap
  // Relaxed: count "built", "developed", "created" as project signals too
  const projectSignals = countRegex(t, /\b(project|built|developed|created|designed)\b/g);
  const projectCount = Math.min(50, projectSignals);

  // avgProjectAgeMonths heuristic: if dates are present, estimate recency; else 0
  // basic: look for year mentions and assume average age = nowYear - medianYear
  const yearMatches = [...t.matchAll(/\b(20\d{2}|19\d{2})\b/g)].map(m => Number(m[1]));
  const nowYear = new Date().getFullYear();
  let avgProjectAgeMonths = 0;
  if (yearMatches.length) {
    yearMatches.sort((a, b) => a - b);
    const medianYear = yearMatches[Math.floor(yearMatches.length / 2)];
    avgProjectAgeMonths = Math.min(240, Math.max(0, (nowYear - medianYear) * 12));
  }

  // timelineGapMonths heuristic: if many transitions/dates missing => higher gap
  // crude proxy: low date density and high claimedYears implies gap
  const dateTokenCount = yearMatches.length;
  let timelineGapMonths = 0;
  if (claimedYears > 0) {
    const density = dateTokenCount / Math.max(1, claimedYears);
    // Relaxed penalty
    timelineGapMonths = Math.min(120, Math.max(0, (1.0 - density) * 12));
  }

  // contributionCount90d/streakWeeks: without GitHub API, infer from keywords
  // leadership_roles heuristic: count occurrences of lead/manager roles
  const leadershipRoles = countRegex(t, /\b(lead|manager|head|director|cto|vp|founder|co-founder|senior)\b/g);

  // num_publications heuristic: count occurrences of paper/publication/conference
  const numPublications = countRegex(t, /\b(paper|publication|conference|journal|proceeedings)\b/g);

  // Return keys matching ml/src/server.py FEATURE_WEIGHTS
  return {
    total_experience_years: claimedYears,
    num_skills: skillCount,
    num_certifications: certMentions,
    num_projects: projectCount,
    education_level: Math.min(4, educationMentions), // Cap at 4 (PhD level in ML server)
    num_publications: numPublications,
    leadership_roles: leadershipRoles,

    // Extra raw features just in case
    hasGithub,
    hasLinks,
    avgProjectAgeMonths,
    avgProjectAgeMonths,
    timelineGapMonths,
    detectedSkills: matches
  };
}