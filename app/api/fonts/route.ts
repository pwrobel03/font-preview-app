import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const fonts = await prisma.font.findMany({
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

  return NextResponse.json(fonts);
}
