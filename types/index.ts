export type FontCategory =
  | "SERIF"
  | "SANS_SERIF"
  | "MONOSPACE"
  | "DISPLAY"
  | "HANDWRITING";

export type FontSource = "GOOGLE" | "LOCAL";

export interface FontRecord {
  id: string;
  name: string;
  slug: string;
  source: FontSource;
  familyCss: string;
  googleName: string | null;
  filePath: string | null;
  category: FontCategory;
  subsets: string[];
  tags: string[];
  isActive: boolean;
}

export const CATEGORY_LABELS: Record<FontCategory, string> = {
  SERIF: "Serif",
  SANS_SERIF: "Sans-serif",
  MONOSPACE: "Monospace",
  DISPLAY: "Display",
  HANDWRITING: "Handwriting",
};

export const SUGGESTED_TAGS = [
  "elegant", "modern", "classic", "playful", "minimal",
  "editorial", "technical", "friendly", "bold", "geometric",
  "humanist", "condensed", "display", "readable", "expressive",
] as const;

export const SUBSET_LABELS: Record<string, string> = {
  latin: "Latin",
  "latin-ext": "Latin Extended",
  cyrillic: "Cyrillic",
  "cyrillic-ext": "Cyrillic Ext.",
  greek: "Greek",
  vietnamese: "Vietnamese",
  devanagari: "Devanagari",
};
