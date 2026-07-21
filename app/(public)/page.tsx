"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FontPreview from "@/components/FontPreview";
import FontSelector from "@/components/FontSelector";
import { CATEGORY_LABELS } from "@/types";
import type { FontRecord } from "@/types";

/* ── Copy CSS dropdown ────────────────────────────────────────────────── */
function CopyCssButton({ font }: { font: FontRecord }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setOpen(false);
    setTimeout(() => setCopied(null), 2000);
  }

  const cssValue = `font-family: ${font.familyCss};`;
  const importUrl = font.source === "GOOGLE" && font.googleName
    ? `@import url('https://fonts.googleapis.com/css2?family=${font.googleName.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap');`
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Copy CSS"
        className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium
                    border transition-colors font-sans ${
                      copied
                        ? "border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                        : "border-border text-ink-muted hover:text-ink hover:border-accent/40 hover:bg-surface"
                    }`}
      >
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy CSS
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border
                        rounded-lg shadow-lg overflow-hidden min-w-[260px]">
          <button
            type="button"
            onClick={() => copy(cssValue, "font-family")}
            className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle transition-colors"
          >
            <p className="text-xs font-medium text-ink mb-0.5">font-family</p>
            <code className="text-[11px] text-ink-muted font-mono break-all">{cssValue}</code>
          </button>

          {importUrl && (
            <button
              type="button"
              onClick={() => copy(importUrl, "@import")}
              className="w-full text-left px-3 py-2.5 border-t border-border
                         hover:bg-surface-subtle transition-colors"
            >
              <p className="text-xs font-medium text-ink mb-0.5">@import (Google Fonts)</p>
              <code className="text-[11px] text-ink-muted font-mono break-all line-clamp-2">{importUrl}</code>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Keyboard shortcut hint ───────────────────────────────────────────── */
function ShortcutHint() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="w-6 h-6 rounded-full border border-border text-ink-muted hover:text-ink
                   hover:border-accent/40 text-xs flex items-center justify-center transition-colors"
      >
        ?
      </button>

      {visible && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-surface border border-border
                        rounded-lg shadow-lg p-3 min-w-[200px] space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-2 font-sans">
            Keyboard shortcuts
          </p>
          {[
            ["←  →", "Prev / next font"],
            ["R", "Random font"],
            ["D", "Toggle dark mode"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-subtle
                             text-[10px] font-mono text-ink-muted">
                {key}
              </kbd>
              <span className="text-xs text-ink-muted font-sans">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Home page ────────────────────────────────────────────────────────── */
function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontRecord | null>(null);
  const [baseSizePx, setBaseSizePx] = useState(16);
  const [loading, setLoading] = useState(true);

  // keep a ref so keyboard handler always sees latest values
  const fontsRef = useRef<FontRecord[]>([]);
  const selectedRef = useRef<FontRecord | null>(null);
  fontsRef.current = fonts;
  selectedRef.current = selectedFont;

  useEffect(() => {
    fetch("/api/fonts")
      .then((r) => r.json())
      .then((data: FontRecord[]) => {
        setFonts(data);
        const slugParam = searchParams.get("font");
        const initial = slugParam
          ? (data.find((f) => f.slug === slugParam) ?? data[0])
          : data[0];
        setSelectedFont(initial ?? null);
        setLoading(false);
      });
  }, [searchParams]);

  const navigateTo = useCallback(
    (font: FontRecord) => {
      setSelectedFont(font);
      const params = new URLSearchParams(searchParams.toString());
      params.set("font", font.slug);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const list = fontsRef.current;
      const current = selectedRef.current;
      if (!list.length || !current) return;

      const idx = list.findIndex((f) => f.slug === current.slug);

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (idx > 0) navigateTo(list[idx - 1]);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (idx < list.length - 1) navigateTo(list[idx + 1]);
          break;
        case "r":
        case "R": {
          const others = list.filter((f) => f.slug !== current.slug);
          if (others.length) navigateTo(others[Math.floor(Math.random() * others.length)]);
          break;
        }
        case "d":
        case "D": {
          const isDark = document.documentElement.classList.toggle("dark");
          localStorage.setItem("theme", isDark ? "dark" : "light");
          break;
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigateTo]);

  /* ── Random font button ── */
  function handleRandom() {
    if (!fonts.length || !selectedFont) return;
    const others = fonts.filter((f) => f.slug !== selectedFont.slug);
    if (others.length) navigateTo(others[Math.floor(Math.random() * others.length)]);
  }

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

  if (!selectedFont) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-ink-muted">
        No fonts found. Run{" "}
        <code className="mx-1 px-1.5 py-0.5 bg-surface-subtle rounded text-xs">
          npx prisma db seed
        </code>{" "}
        first.
      </div>
    );
  }

  const currentIdx = fonts.findIndex((f) => f.slug === selectedFont.slug);

  return (
    <>
      {/* ── Font selector panel ──────────────────────────────────────────── */}
      <div className="sticky top-12 z-30 bg-surface-subtle border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-6 sm:py-8">

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            <FontSelector
              fonts={fonts}
              value={selectedFont}
              onChange={navigateTo}
            />

            {/* Prev / Next / Random */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => currentIdx > 0 && navigateTo(fonts[currentIdx - 1])}
                disabled={currentIdx <= 0}
                title="Previous font (←)"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border
                           text-ink-muted hover:text-ink hover:border-accent/40 hover:bg-surface
                           transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => currentIdx < fonts.length - 1 && navigateTo(fonts[currentIdx + 1])}
                disabled={currentIdx >= fonts.length - 1}
                title="Next font (→)"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border
                           text-ink-muted hover:text-ink hover:border-accent/40 hover:bg-surface
                           transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRandom}
                title="Random font (R)"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border
                           text-ink-muted hover:text-ink hover:border-accent/40 hover:bg-surface
                           transition-colors"
              >
                {/* Dice / shuffle icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </button>
            </div>

            <div className="hidden sm:block w-px h-5 bg-border" />

            {/* Size slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-muted font-sans">Size</span>
              <input
                type="range" min={12} max={24} step={1}
                value={baseSizePx}
                onChange={(e) => setBaseSizePx(Number(e.target.value))}
                className="w-28"
                aria-label="Base font size"
              />
              <span className="text-xs text-ink-muted tabular-nums font-sans w-8">
                {baseSizePx}px
              </span>
            </div>

            <div className="hidden sm:block w-px h-5 bg-border" />

            <span className="text-xs text-ink-muted font-sans hidden sm:block">
              {CATEGORY_LABELS[selectedFont.category]}
            </span>

            <div className="flex flex-wrap gap-1.5">
              {selectedFont.subsets.map((s) => (
                <span key={s} className={`subset-badge subset-${s}`}>{s}</span>
              ))}
            </div>

            {/* Right side actions */}
            <div className="sm:ml-auto flex items-center gap-2">
              {selectedFont.source === "LOCAL" && selectedFont.filePath && (
                <a
                  href={selectedFont.filePath}
                  download
                  title="Download font file"
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium
                             border border-border text-ink-muted hover:text-ink hover:border-accent/40
                             hover:bg-surface transition-colors font-sans"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </a>
              )}

              <CopyCssButton font={selectedFont} />

              <a
                href={`/compare?a=${selectedFont.slug}`}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium
                           border border-border text-ink-muted hover:text-ink hover:border-accent/40
                           hover:bg-surface transition-colors font-sans"
              >
                Compare
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              <ShortcutHint />
            </div>
          </div>

          {/* Font index counter */}
          <p className="mt-2 text-[11px] text-ink-muted font-sans">
            {currentIdx + 1} / {fonts.length} fonts
          </p>
        </div>
      </div>

      {/* ── Preview ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <FontPreview font={selectedFont} baseSizePx={baseSizePx} />
      </div>
    </>
  );
}

export default function HomePage() {
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
      <HomePageInner />
    </Suspense>
  );
}
