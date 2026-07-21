import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { FontCategory } from "@/types";

export const dynamic = "force-dynamic";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const FALLBACK_STACK: Record<FontCategory, string> = {
  SERIF:       "serif",
  SANS_SERIF:  "sans-serif",
  MONOSPACE:   "monospace",
  DISPLAY:     "sans-serif",
  HANDWRITING: "cursive",
};

function buildFamilyCss(name: string, category: FontCategory) {
  return `'${name}', ${FALLBACK_STACK[category]}`;
}

// GET /api/admin/fonts — all fonts including inactive
export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawFonts = await prisma.font.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      source: true,
      familyCss: true,
      googleName: true,
      filePath: true,
      category: true,
      subsets: true,
      isActive: true,
      createdAt: true,
    },
  });

  // tags column added in migration — guard for envs where it hasn't run yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fonts = rawFonts.map((f) => ({ ...f, tags: (f as any).tags ?? [] }));

  return NextResponse.json(fonts);
}

// POST /api/admin/fonts — add a new font
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, googleName, filePath, source = "GOOGLE", category, subsets, tags } = body as {
    name: string;
    googleName?: string;
    filePath?: string;
    source?: "GOOGLE" | "LOCAL";
    category: FontCategory;
    subsets: string[];
    tags?: string[];
  };

  if (!name?.trim() || !category) {
    return NextResponse.json({ error: "name and category are required" }, { status: 400 });
  }
  if (source === "GOOGLE" && !googleName?.trim() && !name?.trim()) {
    return NextResponse.json({ error: "googleName is required for Google Fonts" }, { status: 400 });
  }
  if (source === "LOCAL" && !filePath) {
    return NextResponse.json({ error: "filePath is required for local fonts" }, { status: 400 });
  }

  const resolvedGoogleName = source === "GOOGLE"
    ? (googleName?.trim() || name.trim())
    : undefined;

  // familyCss uses the display name as font-family (must match @font-face declaration for local fonts)
  const slug = slugify(name);
  const familyCss = buildFamilyCss(name.trim(), category);

  // Check for slug conflict
  const existing = await prisma.font.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: `A font with slug "${slug}" already exists.` }, { status: 409 });
  }

  // Resolve addedBy via email lookup — avoids FK violation if the JWT token
  // carries a stale user ID (e.g. after a DB reset with new auto-generated IDs)
  let addedById: string | null = null;
  if (session.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    addedById = dbUser?.id ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const font = await (prisma.font as any).create({
    data: {
      name: name.trim(),
      slug,
      source,
      familyCss,
      googleName: resolvedGoogleName ?? null,
      filePath: filePath ?? null,
      category,
      subsets: subsets?.length ? subsets : ["latin"],
      tags: tags ?? [],
      isActive: true,
      addedBy: addedById,
    },
  });

  return NextResponse.json(font, { status: 201 });
}
