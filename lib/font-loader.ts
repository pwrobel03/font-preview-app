/**
 * Client-side utility to dynamically load a Google Font via @font-face.
 * We inject a <link> to the Google Fonts CSS API — this avoids needing
 * static next/font/google imports and allows runtime font switching.
 */

const loaded = new Set<string>();

export function loadGoogleFont(googleName: string, weights = "300;400;500;600;700"): void {
  if (typeof window === "undefined") return;
  if (loaded.has(googleName)) return;

  const url = `https://fonts.googleapis.com/css2?family=${googleName}:wght@${weights}&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);

  loaded.add(googleName);
}

export function preloadGoogleFonts(googleNames: string[]): void {
  googleNames.forEach((name) => loadGoogleFont(name));
}
