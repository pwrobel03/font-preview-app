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
  isActive: boolean;
}

export const CATEGORY_LABELS: Record<FontCategory, string> = {
  SERIF: "Serif",
  SANS_SERIF: "Sans-serif",
  MONOSPACE: "Monospace",
  DISPLAY: "Display",
  HANDWRITING: "Handwriting",
};
