import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { FontCategory } from "@/types";

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

  const fonts = await prisma.font.findMany({
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

  return NextResponse.json(fonts);
}

// POST /api/admin/fonts — add a new font
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, googleName, category, subsets } = body as {
    name: string;
    googleName?: string;
    category: FontCategory;
    subsets: string[];
  };

  if (!name?.trim() || !category) {
    return NextResponse.json({ error: "name and category are required" }, { status: 400 });
  }

  const resolvedGoogleName = googleName?.trim() || name.trim();
  const slug = slugify(name);
  const familyCss = buildFamilyCss(resolvedGoogleName, category);

  // Check for slug conflict
  const existing = await prisma.font.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: `A font with slug "${slug}" already exists.` }, { status: 409 });
  }

  const font = await prisma.font.create({
    data: {
      name: name.trim(),
      slug,
      source: "GOOGLE",
      familyCss,
      googleName: resolvedGoogleName,
      category,
      subsets: subsets?.length ? subsets : ["latin"],
      isActive: true,
      addedBy: session.user?.id ?? null,
    },
  });

  return NextResponse.json(font, { status: 201 });
}
