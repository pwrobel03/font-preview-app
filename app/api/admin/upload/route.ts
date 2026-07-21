import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_EXTS = [".woff2", ".woff", ".ttf", ".otf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTS.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported format. Allowed: ${ALLOWED_EXTS.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 400 });
  }

  // Sanitise filename
  const baseName = file.name
    .replace(ext, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();
  const fileName = `${baseName}_${Date.now()}${ext}`;

  const fontsDir = path.join(process.cwd(), "public", "fonts");
  await mkdir(fontsDir, { recursive: true });
  const filePath = path.join(fontsDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return NextResponse.json({ filePath: `/fonts/${fileName}` }, { status: 201 });
}
