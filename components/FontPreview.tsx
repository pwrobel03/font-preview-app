"use client";

import { useEffect } from "react";
import { loadGoogleFont } from "@/lib/font-loader";
import { HERO, STATS, CARDS, PULL_QUOTE, DARK_SECTION, FOOTER_TEXT } from "@/lib/content";
import type { FontRecord } from "@/types";

interface Props {
  font: FontRecord;
  baseSizePx?: number;
  compact?: boolean;
}

export default function FontPreview({ font, baseSizePx = 16, compact = false }: Props) {
  useEffect(() => {
    if (font.source === "GOOGLE" && font.googleName) {
      loadGoogleFont(font.googleName);
    }
  }, [font]);

  const ff = font.familyCss;
  const fs = (scale: number) => `${Math.round(baseSizePx * scale)}px`;

  return (
    <div style={{ fontFamily: ff }} className="overflow-hidden rounded-xl border border-border">

      {/* ── HERO — full-bleed photo ───────────────────────────────────────── */}
      <section className="relative h-[520px] flex items-end overflow-hidden">
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1400&q=85"
          alt="Machu Picchu, Peru"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay — bottom-heavy so text is legible */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)" }}
        />
        {/* Content anchored to bottom */}
        <div className="relative w-full px-8 sm:px-14 pb-12">
          <p
            style={{ fontSize: fs(0.75), letterSpacing: "0.18em" }}
            className="uppercase text-white/60 mb-3"
          >
            {HERO.eyebrow}
          </p>
          <h1
            style={{ fontSize: fs(3.5), fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em" }}
            className="text-white max-w-3xl mb-5"
          >
            {HERO.h1}
          </h1>
          <p
            style={{ fontSize: fs(1.125), lineHeight: 1.65 }}
            className="text-white/75 max-w-xl mb-8"
          >
            {HERO.subtitle}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              style={{ fontSize: fs(0.9375), fontWeight: 600, fontFamily: ff }}
              className="px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-white/90 transition-colors"
            >
              {HERO.cta}
            </button>
            <button
              style={{ fontSize: fs(0.9375), fontFamily: ff }}
              className="px-6 py-2.5 rounded-full border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              {HERO.ctaSecondary}
            </button>
          </div>
        </div>
        {/* Photo credit */}
        <span className="absolute bottom-3 right-4 text-[10px] text-white/30 font-sans">
          Photo: Unsplash
        </span>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="bg-surface-subtle border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-x divide-border">
          {STATS.map((s) => (
            <div key={s.label} className="px-4">
              <p
                style={{ fontSize: fs(2.1), fontWeight: 800, lineHeight: 1 }}
                className="text-ink"
              >
                {s.value}
              </p>
              <p style={{ fontSize: fs(0.8) }} className="text-ink-muted mt-1.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARDS GRID ────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-surface-subtle px-6 sm:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              style={{ fontSize: fs(2.25), fontWeight: 700, lineHeight: 1.2 }}
              className="text-slate-800 dark:text-ink mb-4"
            >
              Did you know…?
            </h2>
            <div className="w-16 h-0.5 bg-slate-300 dark:bg-border mx-auto" />
          </div>

          <div className={`grid gap-6 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {CARDS.map((card) => (
              <article
                key={card.id}
                className="bg-white dark:bg-surface rounded-xl overflow-hidden
                           border border-slate-100 dark:border-border
                           hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span
                    style={{ fontSize: fs(0.6875) }}
                    className="inline-block uppercase tracking-widest text-slate-400 dark:text-ink-muted font-sans mb-2"
                  >
                    {card.category}
                  </span>
                  <h3
                    style={{ fontSize: fs(1.125), fontWeight: 700, lineHeight: 1.3 }}
                    className="text-slate-800 dark:text-ink mb-3"
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{ fontSize: fs(0.9375), lineHeight: 1.7 }}
                    className="text-slate-500 dark:text-ink-muted"
                  >
                    {card.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PULL QUOTE ────────────────────────────────────────────────────── */}
      <section className="bg-surface px-6 sm:px-12 py-20 border-y border-slate-100 dark:border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p
            style={{ fontSize: fs(1.6), lineHeight: 1.55, fontStyle: "italic", fontWeight: 400 }}
            className="text-slate-700 dark:text-ink mb-6"
          >
            &ldquo;{PULL_QUOTE.text}&rdquo;
          </p>
          <p style={{ fontSize: fs(0.875) }} className="text-slate-400 dark:text-ink-muted">
            {PULL_QUOTE.attribution}
          </p>
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────────────────── */}
      <section className="bg-surface-subtle border-t border-border px-6 sm:px-12 py-20">
        <div className="max-w-3xl mx-auto">
          <h2
            style={{ fontSize: fs(2.25), fontWeight: 700, lineHeight: 1.2 }}
            className="text-ink mb-6"
          >
            {DARK_SECTION.h2}
          </h2>
          <p
            style={{ fontSize: fs(1.0625), lineHeight: 1.8 }}
            className="text-ink-muted mb-10"
          >
            {DARK_SECTION.body}
          </p>
          <button
            style={{ fontSize: fs(0.9375), fontWeight: 600, fontFamily: ff }}
            className="inline-flex items-center gap-2 text-accent border-b border-accent/30
                       hover:border-accent pb-0.5 transition-colors"
          >
            {DARK_SECTION.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-surface border-t border-border px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p style={{ fontSize: fs(0.8125) }} className="text-ink-muted font-sans">{FOOTER_TEXT}</p>
          <p style={{ fontSize: fs(0.8125) }} className="text-ink-muted font-sans">
            Previewing: <span className="text-ink">{font.name}</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
