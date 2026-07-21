import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawFonts = await prisma.font.findMany({
    where: { isActive: true },
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
    },
  });

  // tags column added in migration — guard for envs where it hasn't run yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fonts = rawFonts.map((f) => ({ ...f, tags: (f as any).tags ?? [] }));

  return NextResponse.json(fonts);
}
