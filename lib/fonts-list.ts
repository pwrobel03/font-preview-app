/**
 * Master list of fonts available in the app.
 * All are Google Fonts — loaded at runtime via @font-face injection.
 * This file is used by the seed script to pre-populate the DB.
 *
 * subsets reference:
 *   latin        — English + basic Western European
 *   latin-ext    — Extended Latin: Polish, Czech, Romanian, etc.
 *   cyrillic     — Russian, Bulgarian, Serbian, etc.
 *   cyrillic-ext — Extended Cyrillic
 *   greek        — Modern Greek
 *   vietnamese   — Vietnamese
 *   devanagari   — Hindi, Marathi, etc.
 */

import type { FontCategory } from "@/types";

export interface FontSeedEntry {
  name: string;
  slug: string;
  googleName: string;
  familyCss: string;
  category: FontCategory;
  subsets: string[];
}

export const FONTS_SEED: FontSeedEntry[] = [
  // ─── SERIF ────────────────────────────────────────────────────────────────
  {
    name: "Playfair Display",
    slug: "playfair-display",
    googleName: "Playfair+Display",
    familyCss: "'Playfair Display', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },
  {
    name: "Merriweather",
    slug: "merriweather",
    googleName: "Merriweather",
    familyCss: "'Merriweather', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },
  {
    name: "Lora",
    slug: "lora",
    googleName: "Lora",
    familyCss: "'Lora', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },
  {
    name: "PT Serif",
    slug: "pt-serif",
    googleName: "PT+Serif",
    familyCss: "'PT Serif', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic"],
  },
  {
    name: "Libre Baskerville",
    slug: "libre-baskerville",
    googleName: "Libre+Baskerville",
    familyCss: "'Libre Baskerville', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "EB Garamond",
    slug: "eb-garamond",
    googleName: "EB+Garamond",
    familyCss: "'EB Garamond', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "greek", "vietnamese"],
  },
  {
    name: "Cormorant Garamond",
    slug: "cormorant-garamond",
    googleName: "Cormorant+Garamond",
    familyCss: "'Cormorant Garamond', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },
  {
    name: "Crimson Text",
    slug: "crimson-text",
    googleName: "Crimson+Text",
    familyCss: "'Crimson Text', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Source Serif 4",
    slug: "source-serif-4",
    googleName: "Source+Serif+4",
    familyCss: "'Source Serif 4', serif",
    category: "SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "greek", "vietnamese"],
  },

  // ─── SANS-SERIF ───────────────────────────────────────────────────────────
  {
    name: "Inter",
    slug: "inter",
    googleName: "Inter",
    familyCss: "'Inter', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "vietnamese"],
  },
  {
    name: "DM Sans",
    slug: "dm-sans",
    googleName: "DM+Sans",
    familyCss: "'DM Sans', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Outfit",
    slug: "outfit",
    googleName: "Outfit",
    familyCss: "'Outfit', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin"],
  },
  {
    name: "Plus Jakarta Sans",
    slug: "plus-jakarta-sans",
    googleName: "Plus+Jakarta+Sans",
    familyCss: "'Plus Jakarta Sans', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Nunito",
    slug: "nunito",
    googleName: "Nunito",
    familyCss: "'Nunito', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },
  {
    name: "Poppins",
    slug: "poppins",
    googleName: "Poppins",
    familyCss: "'Poppins', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "devanagari"],
  },
  {
    name: "Raleway",
    slug: "raleway",
    googleName: "Raleway",
    familyCss: "'Raleway', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "cyrillic"],
  },
  {
    name: "Mulish",
    slug: "mulish",
    googleName: "Mulish",
    familyCss: "'Mulish', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },
  {
    name: "Manrope",
    slug: "manrope",
    googleName: "Manrope",
    familyCss: "'Manrope', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "cyrillic", "greek"],
  },
  {
    name: "Work Sans",
    slug: "work-sans",
    googleName: "Work+Sans",
    familyCss: "'Work Sans', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "vietnamese"],
  },
  {
    name: "Jost",
    slug: "jost",
    googleName: "Jost",
    familyCss: "'Jost', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "cyrillic"],
  },
  {
    name: "Barlow",
    slug: "barlow",
    googleName: "Barlow",
    familyCss: "'Barlow', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext", "vietnamese"],
  },
  {
    name: "Karla",
    slug: "karla",
    googleName: "Karla",
    familyCss: "'Karla', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Figtree",
    slug: "figtree",
    googleName: "Figtree",
    familyCss: "'Figtree', sans-serif",
    category: "SANS_SERIF",
    subsets: ["latin", "latin-ext"],
  },

  // ─── MONOSPACE ────────────────────────────────────────────────────────────
  {
    name: "JetBrains Mono",
    slug: "jetbrains-mono",
    googleName: "JetBrains+Mono",
    familyCss: "'JetBrains Mono', monospace",
    category: "MONOSPACE",
    subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek"],
  },
  {
    name: "Fira Code",
    slug: "fira-code",
    googleName: "Fira+Code",
    familyCss: "'Fira Code', monospace",
    category: "MONOSPACE",
    subsets: ["latin", "latin-ext", "cyrillic", "greek"],
  },
  {
    name: "IBM Plex Mono",
    slug: "ibm-plex-mono",
    googleName: "IBM+Plex+Mono",
    familyCss: "'IBM Plex Mono', monospace",
    category: "MONOSPACE",
    subsets: ["latin", "latin-ext", "cyrillic"],
  },
  {
    name: "Source Code Pro",
    slug: "source-code-pro",
    googleName: "Source+Code+Pro",
    familyCss: "'Source Code Pro', monospace",
    category: "MONOSPACE",
    subsets: ["latin", "latin-ext", "greek", "vietnamese"],
  },

  // ─── DISPLAY ──────────────────────────────────────────────────────────────
  {
    name: "Syne",
    slug: "syne",
    googleName: "Syne",
    familyCss: "'Syne', sans-serif",
    category: "DISPLAY",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Space Grotesk",
    slug: "space-grotesk",
    googleName: "Space+Grotesk",
    familyCss: "'Space Grotesk', sans-serif",
    category: "DISPLAY",
    subsets: ["latin", "latin-ext", "vietnamese"],
  },
  {
    name: "Russo One",
    slug: "russo-one",
    googleName: "Russo+One",
    familyCss: "'Russo One', sans-serif",
    category: "DISPLAY",
    subsets: ["latin", "cyrillic"],
  },
  {
    name: "Bebas Neue",
    slug: "bebas-neue",
    googleName: "Bebas+Neue",
    familyCss: "'Bebas Neue', cursive",
    category: "DISPLAY",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Anton",
    slug: "anton",
    googleName: "Anton",
    familyCss: "'Anton', sans-serif",
    category: "DISPLAY",
    subsets: ["latin", "latin-ext", "vietnamese"],
  },
  {
    name: "Righteous",
    slug: "righteous",
    googleName: "Righteous",
    familyCss: "'Righteous', cursive",
    category: "DISPLAY",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Oswald",
    slug: "oswald",
    googleName: "Oswald",
    familyCss: "'Oswald', sans-serif",
    category: "DISPLAY",
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
  },

  // ─── HANDWRITING ─────────────────────────────────────────────────────────
  {
    name: "Dancing Script",
    slug: "dancing-script",
    googleName: "Dancing+Script",
    familyCss: "'Dancing Script', cursive",
    category: "HANDWRITING",
    subsets: ["latin", "latin-ext", "vietnamese"],
  },
  {
    name: "Pacifico",
    slug: "pacifico",
    googleName: "Pacifico",
    familyCss: "'Pacifico', cursive",
    category: "HANDWRITING",
    subsets: ["latin", "cyrillic", "vietnamese"],
  },
  {
    name: "Caveat",
    slug: "caveat",
    googleName: "Caveat",
    familyCss: "'Caveat', cursive",
    category: "HANDWRITING",
    subsets: ["latin", "latin-ext", "cyrillic"],
  },
  {
    name: "Great Vibes",
    slug: "great-vibes",
    googleName: "Great+Vibes",
    familyCss: "'Great Vibes', cursive",
    category: "HANDWRITING",
    subsets: ["latin", "latin-ext"],
  },
  {
    name: "Satisfy",
    slug: "satisfy",
    googleName: "Satisfy",
    familyCss: "'Satisfy', cursive",
    category: "HANDWRITING",
    subsets: ["latin"],
  },
  {
    name: "Permanent Marker",
    slug: "permanent-marker",
    googleName: "Permanent+Marker",
    familyCss: "'Permanent Marker', cursive",
    category: "HANDWRITING",
    subsets: ["latin"],
  },
];
