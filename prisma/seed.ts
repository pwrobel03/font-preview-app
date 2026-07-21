import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FONTS_SEED } from "../lib/fonts-list";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────────
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, passwordHash, role: "ADMIN" },
    });
    console.log(`✅ Admin created: ${email}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${email}`);
  }

  // ── Fonts ───────────────────────────────────────────────────────────────────
  let created = 0;
  let skipped = 0;

  for (const font of FONTS_SEED) {
    const exists = await prisma.font.findUnique({ where: { slug: font.slug } });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.font.create({
      data: {
        name: font.name,
        slug: font.slug,
        source: "GOOGLE",
        googleName: font.googleName,
        familyCss: font.familyCss,
        category: font.category,
        isActive: true,
      },
    });
    created++;
  }

  console.log(`✅ Fonts: ${created} created, ${skipped} already existed`);
  console.log("🎉 Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
