/**
 * Client-side utility to dynamically load fonts at runtime.
 * - Google Fonts: injects a <link> to the Google Fonts CSS2 API
 * - Local fonts:  injects a <style> with an @font-face rule
 */

import type { FontRecord } from "@/types";

const loaded = new Set<string>();

export function loadGoogleFont(googleName: string, weights = "300;400;500;600;700"): void {
  if (typeof window === "undefined") return;
  if (loaded.has(`gf:${googleName}`)) return;

  // Google Fonts CSS2 API requires spaces encoded as "+"
  const encoded = googleName.replace(/ /g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weights}&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);

  loaded.add(`gf:${googleName}`);
}

export function loadLocalFont(familyCss: string, filePath: string): void {
  if (typeof window === "undefined") return;
  if (loaded.has(`local:${filePath}`)) return;

  // Extract the bare family name from e.g. "'My Font', sans-serif"
  const familyName = familyCss.split(",")[0].trim().replace(/['"]/g, "");

  // Detect format from extension
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "woff2";
  const formatMap: Record<string, string> = {
    woff2: "woff2",
    woff:  "woff",
    ttf:   "truetype",
    otf:   "opentype",
  };
  const format = formatMap[ext] ?? "woff2";

  const style = document.createElement("style");
  style.textContent = [
    `@font-face {`,
    `  font-family: '${familyName}';`,
    `  src: url('${filePath}') format('${format}');`,
    `  font-display: swap;`,
    `}`,
  ].join("\n");
  document.head.appendChild(style);

  loaded.add(`local:${filePath}`);
}

/** Unified loader — handles both GOOGLE and LOCAL sources. */
export function loadFont(font: Pick<FontRecord, "source" | "googleName" | "familyCss" | "filePath">): void {
  if (font.source === "GOOGLE" && font.googleName) {
    loadGoogleFont(font.googleName);
  } else if (font.source === "LOCAL" && font.filePath) {
    loadLocalFont(font.familyCss, font.filePath);
  }
}

export function preloadFonts(fonts: Pick<FontRecord, "source" | "googleName" | "familyCss" | "filePath">[]): void {
  fonts.forEach(loadFont);
}
