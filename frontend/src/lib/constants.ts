// Shared constants used across Institution pages
export const CATEGORIES: Record<number, string> = {
  0: "General",
  1: "Software Development",
  2: "Blockchain",
  3: "Data Science",
  4: "Cybersecurity",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([id, name]) => ({
  id: Number(id),
  name,
}));
