"use client";

import { useState, useRef, useEffect } from "react";
import type { FontRecord, FontCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { loadGoogleFont } from "@/lib/font-loader";

interface Props {
  fonts: FontRecord[];
  value: FontRecord;
  onChange: (font: FontRecord) => void;
  label?: string;
  dark?: boolean;
}

export default function FontSelector({ fonts, value, onChange, label, dark = false }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FontCategory | "ALL">("ALL");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fontsPreloaded = useRef(false);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      // Load all Google Fonts on first open so names render in their own typeface
      if (!fontsPreloaded.current) {
        fontsPreloaded.current = true;
        fonts.forEach((f) => {
          if (f.source === "GOOGLE" && f.googleName) {
            loadGoogleFont(f.googleName);
          }
        });
      }
    }
  }, [open, fonts]);

  const categories = ["ALL", ...Object.keys(CATEGORY_LABELS)] as (FontCategory | "ALL")[];

  const filtered = fonts.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "ALL" || f.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div ref={ref} className="relative">
      {label && (
        <p className="text-xs text-ink-muted mb-1">{label}</p>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-md text-sm font-medium
                    min-w-[200px] focus:outline-none transition-colors ${
                      dark
                        ? "hover:brightness-110"
                        : "border border-border bg-surface text-ink hover:border-accent/40 focus:ring-2 focus:ring-accent/30"
                    }`}
        style={dark ? {
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#ffffff",
        } : {}}
      >
        <span className="flex-1 text-left truncate">{value.name}</span>
        <span
          className="text-[10px] font-normal shrink-0"
          style={{ color: dark ? "rgba(255,255,255,0.4)" : "var(--color-ink-muted)" }}
        >
          {CATEGORY_LABELS[value.category]}
        </span>
        <svg
          className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          style={{ color: dark ? "rgba(255,255,255,0.4)" : "var(--color-ink-muted)" }}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-lg border border-border bg-surface shadow-lg
                        overflow-hidden">
          {/* Search */}
          <div className="px-2 pt-2 pb-1.5 border-b border-border">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search fonts…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-8 pl-7 pr-2 rounded-md text-sm bg-surface-subtle border border-border
                           text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2
                           focus:ring-accent/30 focus:border-accent/40 transition-colors"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 px-2 py-1.5 border-b border-border overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 h-6 px-2.5 rounded text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
                }`}
              >
                {cat === "ALL" ? "All" : CATEGORY_LABELS[cat as FontCategory]}
              </button>
            ))}
          </div>

          {/* Font list */}
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-ink-muted text-center">
                No fonts match your search
              </li>
            ) : (
              filtered.map((font) => {
                const isActive = font.slug === value.slug;
                return (
                  <li key={font.slug}>
                    <button
                      type="button"
                      onClick={() => { onChange(font); setOpen(false); setQuery(""); }}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-2
                                  hover:bg-surface-subtle transition-colors ${
                                    isActive ? "bg-surface-subtle" : ""
                                  }`}
                    >
                      {/* Checkmark for active */}
                      <span className="w-4 shrink-0 flex items-center justify-center">
                        {isActive && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" className="text-accent">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        )}
                      </span>

                      {/* Font name rendered in its own typeface */}
                      <span
                        className="flex-1 truncate"
                        style={{
                          fontFamily: font.familyCss,
                          fontSize: "15px",
                          color: isActive
                            ? "var(--color-accent)"
                            : "var(--color-ink)",
                        }}
                      >
                        {font.name}
                      </span>

                      {/* Category label in system font */}
                      <span className="text-[10px] text-ink-muted shrink-0 font-sans">
                        {CATEGORY_LABELS[font.category]}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer count */}
          <div className="px-3 py-1.5 border-t border-border">
            <p className="text-[11px] text-ink-muted">
              {filtered.length} of {fonts.length} fonts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
