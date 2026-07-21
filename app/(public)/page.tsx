"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FontPreview from "@/components/FontPreview";
import FontSelector from "@/components/FontSelector";
import type { FontRecord } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontRecord | null>(null);
  const [baseSizePx, setBaseSizePx] = useState(16);
  const [loading, setLoading] = useState(true);

  // Fetch fonts from API
  useEffect(() => {
    fetch("/api/fonts")
      .then((r) => r.json())
      .then((data: FontRecord[]) => {
        setFonts(data);
        // Pick font from URL param or default to first
        const slugParam = searchParams.get("font");
        const initial = slugParam
          ? data.find((f) => f.slug === slugParam) ?? data[0]
          : data[0];
        setSelectedFont(initial ?? null);
        setLoading(false);
      });
  }, [searchParams]);

  // Sync URL when font changes
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
      <div className="flex items-center justify-center h-64 text-ink-muted text-sm">
        Loading fonts…
      </div>
    );
  }

  if (!selectedFont) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-muted text-sm">
        No fonts available. Run the seed script first.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-4 mb-8 pb-6 border-b border-border">
        <FontSelector
          fonts={fonts}
          value={selectedFont}
          onChange={handleFontChange}
          label="Font"
        />

        {/* Size slider */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted">
            Base size — {baseSizePx}px
          </label>
          <input
            type="range"
            min={12}
            max={24}
            step={1}
            value={baseSizePx}
            onChange={(e) => setBaseSizePx(Number(e.target.value))}
            className="w-36 accent-accent"
          />
        </div>

        {/* Subset badges */}
        <div className="flex flex-wrap gap-1 items-center">
          {selectedFont.subsets.map((s) => (
            <span
              key={s}
              className={`subset-badge subset-${s}`}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Compare shortcut */}
        <a
          href={`/compare?a=${selectedFont.slug}`}
          className="ml-auto text-xs text-ink-muted hover:text-accent transition-colors underline underline-offset-2"
        >
          Compare this font →
        </a>
      </div>

      {/* Preview */}
      <FontPreview font={selectedFont} baseSizePx={baseSizePx} />
    </div>
  );
}
