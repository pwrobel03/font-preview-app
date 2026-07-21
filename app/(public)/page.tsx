"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FontPreview from "@/components/FontPreview";
import FontSelector from "@/components/FontSelector";
import { CATEGORY_LABELS } from "@/types";
import type { FontRecord } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontRecord | null>(null);
  const [baseSizePx, setBaseSizePx] = useState(16);
  const [loading, setLoading] = useState(true);

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

  const handleFontChange = useCallback(
    (font: FontRecord) => {
      setSelectedFont(font);
      const params = new URLSearchParams(searchParams.toString());
      params.set("font", font.slug);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

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

  return (
    <>
      {/* ── Font selector panel — sticky below header ────────────────────── */}
      <div className="sticky top-12 z-30 bg-surface-subtle border-b border-border">
        <div className="bg-surface-subtle max-w-screen-xl mx-auto px-6 sm:px-10 py-6 sm:py-8">

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-4">
            <FontSelector
              fonts={fonts}
              value={selectedFont}
              onChange={handleFontChange}
            />

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

            <span className="text-xs text-ink-muted font-sans">
              {CATEGORY_LABELS[selectedFont.category]}
            </span>

            <div className="flex flex-wrap gap-1.5">
              {selectedFont.subsets.map((s) => (
                <span key={s} className={`subset-badge subset-${s}`}>{s}</span>
              ))}
            </div>

            <a
              href={`/compare?a=${selectedFont.slug}`}
              className="sm:ml-auto flex items-center gap-1.5 text-sm text-accent
                         hover:underline underline-offset-2 transition-colors font-sans"
            >
              Compare
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Preview ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <FontPreview font={selectedFont} baseSizePx={baseSizePx} />
      </div>
    </>
  );
}
