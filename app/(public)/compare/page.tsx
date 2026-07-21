"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FontSelector from "@/components/FontSelector";
import FontPreview from "@/components/FontPreview";
import { loadGoogleFont } from "@/lib/font-loader";
import type { FontRecord } from "@/types";

/* ── Main page ─────────────────────────────────────────────────────────── */
function ComparePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [fontA, setFontA] = useState<FontRecord | null>(null);
  const [fontB, setFontB] = useState<FontRecord | null>(null);
  const [sizeA, setSizeA] = useState(13);
  const [sizeB, setSizeB] = useState(13);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fonts")
      .then((r) => r.json())
      .then((data: FontRecord[]) => {
        setFonts(data);
        const aSlug = searchParams.get("a");
        const bSlug = searchParams.get("b");
        const first  = data[0] ?? null;
        const second = data[1] ?? null;
        setFontA(aSlug ? (data.find((f) => f.slug === aSlug) ?? first) : first);
        setFontB(bSlug ? (data.find((f) => f.slug === bSlug) ?? second) : second);
        setLoading(false);

        // Preload all fonts so selectors render names in their own typeface
        data.forEach((f) => {
          if (f.source === "GOOGLE" && f.googleName) loadGoogleFont(f.googleName);
        });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUrl = useCallback(
    (a: FontRecord, b: FontRecord) => {
      const params = new URLSearchParams();
      params.set("a", a.slug);
      params.set("b", b.slug);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleChangeA = useCallback(
    (f: FontRecord) => { setFontA(f); if (fontB) updateUrl(f, fontB); },
    [fontB, updateUrl]
  );

  const handleChangeB = useCallback(
    (f: FontRecord) => { setFontB(f); if (fontA) updateUrl(fontA, f); },
    [fontA, updateUrl]
  );

  const handleSwap = () => {
    if (!fontA || !fontB) return;
    setFontA(fontB);
    setFontB(fontA);
    setSizeA(sizeB);
    setSizeB(sizeA);
    updateUrl(fontB, fontA);
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

  if (!fontA || !fontB) {
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

  return (
    <>
      {/* ── Sticky toolbar ──────────────────────────────────────────────── */}
      <div className="sticky top-12 z-30 bg-surface-subtle border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4">

          {/* ── Column A controls ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-sans font-semibold text-ink-muted">A</span>
            <FontSelector fonts={fonts} value={fontA} onChange={handleChangeA} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-sans">Size</span>
              <input
                type="range" min={10} max={18} step={1}
                value={sizeA}
                onChange={(e) => setSizeA(Number(e.target.value))}
                className="w-20"
                aria-label="Font A base size"
              />
              <span className="text-xs text-ink-muted tabular-nums font-sans w-7">{sizeA}px</span>
            </div>
          </div>

          {/* Swap button */}
          <button
            type="button"
            onClick={handleSwap}
            title="Swap fonts"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border
                       text-ink-muted hover:text-ink hover:border-accent/40 hover:bg-surface
                       transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
            </svg>
          </button>

          {/* ── Column B controls ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-sans font-semibold text-ink-muted">B</span>
            <FontSelector fonts={fonts} value={fontB} onChange={handleChangeB} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-sans">Size</span>
              <input
                type="range" min={10} max={18} step={1}
                value={sizeB}
                onChange={(e) => setSizeB(Number(e.target.value))}
                className="w-20"
                aria-label="Font B base size"
              />
              <span className="text-xs text-ink-muted tabular-nums font-sans w-7">{sizeB}px</span>
            </div>
          </div>

          {/* Back link */}
          <a
            href={`/?font=${fontA.slug}`}
            className="sm:ml-auto flex items-center gap-1.5 text-sm text-accent
                       hover:underline underline-offset-2 transition-colors font-sans shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to preview
          </a>
        </div>
      </div>

      {/* ── Side-by-side previews ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Column A */}
        <div className="min-w-0 p-4 sm:p-6">
          <FontPreview font={fontA} baseSizePx={sizeA} compact />
        </div>

        {/* Column B */}
        <div className="min-w-0 p-4 sm:p-6">
          <FontPreview font={fontB} baseSizePx={sizeB} compact />
        </div>
      </div>
    </>
  );
}

export default function ComparePage() {
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
      <ComparePageInner />
    </Suspense>
  );
}
