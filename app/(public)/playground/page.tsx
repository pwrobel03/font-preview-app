"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FontSelector from "@/components/FontSelector";
import { loadFont } from "@/lib/font-loader";
import { CATEGORY_LABELS } from "@/types";
import type { FontRecord } from "@/types";

/* ── Type scale definition ───────────────────────────────────────────── */
const SCALE = [
  { label: "Display", size: 72, weight: 800, lh: 1.05 },
  { label: "Heading 1", size: 48, weight: 700, lh: 1.08 },
  { label: "Heading 2", size: 36, weight: 600, lh: 1.15 },
  { label: "Heading 3", size: 24, weight: 600, lh: 1.25 },
  { label: "Body", size: 16, weight: 400, lh: 1.70 },
  { label: "Caption", size: 12, weight: 400, lh: 1.60 },
];

const DEFAULT_TEXT = "The quick brown fox jumps over the lazy dog";

/* ── Export helper ───────────────────────────────────────────────────── */
async function exportToPng(el: HTMLElement, fontName: string) {
  // dynamic import so it only loads client-side
  const html2canvas = (await import("html2canvas")).default;

  // Wait for all fonts to be ready before capture
  await document.fonts.ready;

  const canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: 2,           // retina quality
    useCORS: false,     // no external images on this page
    logging: false,
    onclone: (clonedDoc) => {
      // Ensure cloned document inherits all stylesheets
      const clonedEl = clonedDoc.getElementById("playground-canvas");
      if (clonedEl) clonedEl.style.padding = "48px";
    },
  });

  const link = document.createElement("a");
  link.download = `${fontName.toLowerCase().replace(/\s+/g, "-")}-preview.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* ── Playground inner ────────────────────────────────────────────────── */
function PlaygroundInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [font, setFont] = useState<FontRecord | null>(null);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [bgColor, setBgColor] = useState<"white" | "black">("white");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fonts")
      .then((r) => r.json())
      .then((data: FontRecord[]) => {
        setFonts(data);
        const slug = searchParams.get("font");
        const initial = slug ? (data.find((f) => f.slug === slug) ?? data[0]) : data[0];
        setFont(initial ?? null);
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (font) loadFont(font);
  }, [font]);

  const handleFontChange = useCallback(
    (f: FontRecord) => {
      setFont(f);
      const params = new URLSearchParams(searchParams.toString());
      params.set("font", f.slug);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleExport = async () => {
    if (!canvasRef.current || !font) return;
    setExporting(true);
    try {
      await exportToPng(canvasRef.current, font.name);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Try again.");
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading fonts…
        </div>
      </div>
    );
  }

  if (!font) return null;

  const ff = font.familyCss;

  return (
    <>
      {/* ── Sticky toolbar ──────────────────────────────────────────────── */}
      <div className="sticky top-12 z-30 bg-surface-subtle border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">

          <FontSelector fonts={fonts} value={font} onChange={handleFontChange} />

          <div className="hidden sm:block w-px h-5 bg-border" />

          {/* Text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text…"
            className="flex-1 min-w-[180px] max-w-sm h-9 px-3 rounded-md border border-border
                       bg-surface text-ink text-sm focus:outline-none focus:ring-2
                       focus:ring-accent/30 focus:border-accent/40 transition-colors
                       placeholder:text-ink-muted"
          />

          <div className="hidden sm:block w-px h-5 bg-border" />

          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white
                       text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {exporting ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export PNG
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Outer shell — matches site chrome, NOT exported */}
        <div className="rounded-xl border border-border overflow-hidden">

          {/* Header strip — NOT exported */}
          <div className="px-6 py-3 bg-surface-subtle border-b border-border flex items-center gap-3">
            <span
              className="text-sm font-medium text-ink"
              style={{ fontFamily: ff }}
            >
              {font.name}
            </span>
            <span className="text-xs text-ink-muted font-sans">
              {CATEGORY_LABELS[font.category]}
            </span>
            <span className="ml-auto text-xs text-ink-muted font-sans">
              {text.length} chars
            </span>
          </div>

          {/* ↓ THIS div is captured as PNG ↓ */}
          <div
            id="playground-canvas"
            ref={canvasRef}
            className="p-8 sm:p-12"
            style={{
              fontFamily: ff,
            }}
          >
            {/* Font label (subtle, top-left) */}
            <p
              className="mb-10"
              style={{
                fontSize: 11,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              {font.name} · {CATEGORY_LABELS[font.category]}
            </p>

            {/* Type scale rows */}
            <div className="space-y-8">
              {SCALE.map(({ label, size, weight, lh }) => (
                <div key={label} className="flex items-baseline gap-6 group">
                  {/* Size label — right-aligned, fixed width */}
                  <div
                    className="shrink-0 text-right"
                    style={{
                      color: "var(--color-ink-muted)",
                      width: 72,
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      paddingTop: 4,
                    }}
                  >
                    {label}
                    <br />
                    <span style={{ fontSize: 9 }}>{size}px</span>
                  </div>

                  {/* Divider */}
                  <div
                    className="shrink-0 w-px self-stretch"
                  />

                  {/* Text */}
                  <p
                    className="flex-1 min-w-0 break-words"
                    style={{
                      fontFamily: ff,
                      fontSize: size,
                      fontWeight: weight,
                      lineHeight: lh,
                      margin: 0,
                    }}
                  >
                    {text || DEFAULT_TEXT}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom rule */}
            <div
              className="mt-12 pt-4"
              style={{
                borderTop: `1px solid`,
              }}
            >
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: "var(--color-accent)",
                }}
              >
                FontPreview · {font.name} · {new Date().getFullYear()}
              </p>
            </div>
          </div>
          {/* ↑ end export canvas ↑ */}
        </div>
      </div>
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading…
        </div>
      </div>
    }>
      <PlaygroundInner />
    </Suspense>
  );
}
