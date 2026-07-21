"use client";

import { useEffect } from "react";
import { loadGoogleFont } from "@/lib/font-loader";
import { CONTENT } from "@/lib/content";
import type { FontRecord } from "@/types";

interface Props {
  font: FontRecord;
  baseSizePx?: number;
}

export default function FontPreview({ font, baseSizePx = 16 }: Props) {
  useEffect(() => {
    if (font.source === "GOOGLE" && font.googleName) {
      loadGoogleFont(font.googleName);
    }
  }, [font]);

  const style = {
    fontFamily: font.familyCss,
    fontSize: `${baseSizePx}px`,
  } as React.CSSProperties;

  return (
    <article style={style} className="text-ink leading-relaxed space-y-8">

      {/* Heading scale */}
      <section className="space-y-2 pb-6 border-b border-border">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-4">
          Heading scale
        </p>
        <h1 style={{ fontSize: `${baseSizePx * 3}px`, lineHeight: 1.1 }} className="font-bold">
          {CONTENT.h1}
        </h1>
        <h2 style={{ fontSize: `${baseSizePx * 2.25}px`, lineHeight: 1.2 }} className="font-bold">
          {CONTENT.h2}
        </h2>
        <h3 style={{ fontSize: `${baseSizePx * 1.75}px`, lineHeight: 1.3 }} className="font-semibold">
          {CONTENT.h3}
        </h3>
        <h4 style={{ fontSize: `${baseSizePx * 1.375}px`, lineHeight: 1.4 }} className="font-semibold">
          {CONTENT.h4}
        </h4>
      </section>

      {/* Body text */}
      <section className="pb-6 border-b border-border space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-4">
          Body text
        </p>
        {CONTENT.bodyLong.split("\n\n").map((para, i) => (
          <p key={i} style={{ fontSize: `${baseSizePx}px`, lineHeight: 1.7 }}>
            {para}
          </p>
        ))}
      </section>

      {/* Pull quote */}
      <section className="pb-6 border-b border-border">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-4">
          Pull quote
        </p>
        <blockquote
          style={{ fontSize: `${baseSizePx * 1.25}px`, lineHeight: 1.55 }}
          className="border-l-4 border-accent pl-5 italic text-ink-muted"
        >
          {CONTENT.pullQuote}
        </blockquote>
      </section>

      {/* Image caption */}
      <section className="pb-6 border-b border-border">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-4">
          Caption
        </p>
        {/* Placeholder image */}
        <div className="w-full aspect-video bg-surface-subtle rounded-md mb-3 flex items-center justify-center">
          <svg className="text-border" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
        <p
          style={{ fontSize: `${baseSizePx * 0.875}px`, lineHeight: 1.5 }}
          className="text-ink-muted"
        >
          {CONTENT.caption}
        </p>
      </section>

      {/* List */}
      <section className="pb-6 border-b border-border">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-4">
          List
        </p>
        <p
          style={{ fontSize: `${baseSizePx * 1.125}px` }}
          className="font-semibold mb-3"
        >
          {CONTENT.listHeading}
        </p>
        <ul className="space-y-2">
          {CONTENT.listItems.map((item, i) => (
            <li
              key={i}
              style={{ fontSize: `${baseSizePx}px`, lineHeight: 1.6 }}
              className="flex gap-2"
            >
              <span className="text-accent shrink-0 mt-1">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Small text & link */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-4">
          Small text &amp; link
        </p>
        <p style={{ fontSize: `${baseSizePx * 0.875}px` }} className="text-ink-muted mb-2">
          {CONTENT.bodyShort}
        </p>
        <a
          href="#"
          style={{ fontSize: `${baseSizePx}px` }}
          className="text-accent underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          {CONTENT.linkText}
        </a>
        <p
          style={{ fontSize: `${baseSizePx * 0.75}px` }}
          className="text-ink-muted mt-6 font-sans"
        >
          {CONTENT.metaLabel} · {font.name} · {font.category.replace("_", "-").toLowerCase()}
        </p>
      </section>
    </article>
  );
}
