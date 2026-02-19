export const GINCANA_PROJECT_ID =
  "217e4b87-8a14-4025-9782-209aabd307a0" as const;

export const AGE_RANGES = [
  { value: "all", label: "Todas" },
  { value: "0-12", label: "Até 12 anos" },
  { value: "13-17", label: "13 a 17 anos" },
  { value: "18+", label: "18 anos ou mais" },
] as const;

export type AgeRangeValue = (typeof AGE_RANGES)[number]["value"];
