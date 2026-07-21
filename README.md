# FontPreview

**Live:** [fonts.wrobeldev.cloud](https://fonts.wrobeldev.cloud)

An internal tool for browsing, comparing, and managing typefaces — built with Next.js, Prisma, and Tailwind CSS.

<img src="https://github.com/pwrobel03/font-preview-app/blob/main/public/images/compare.png" alt="Compare view" width="100%"/>

<p align="center">
  <img src="https://github.com/pwrobel03/font-preview-app/blob/main/public/images/preview.png" alt="Preview" width="32%">
  <img src="https://github.com/pwrobel03/font-preview-app/blob/main/public/images/gallery.png" alt="Gallery view" width="32%"/>
  <img src="https://github.com/pwrobel03/font-preview-app/blob/main/public/images/playground.png" alt="Playground view" width="32%"/>
</p>

> [!NOTE]
> Because of the fact that the app is public, I haven't provide access to admin panel for everyone. You can test admin future only by setting up your own app.

## Features

- **Gallery** — browse all fonts by category or tag, with live rendering of each typeface
- **Preview** — full type scale (12–72 px) with adjustable base size and dark mode
- **Compare** — side-by-side A/B comparison of any two fonts with independent size controls
- **Playground** — editable text preview across the full type scale, exportable as a PNG
- **Admin panel** — add fonts from Google Fonts or upload local files (`.woff2`, `.woff`, `.ttf`, `.otf`); toggle visibility; manage tags
- **Copy CSS** — one-click copy of `font-family` declaration or `@import` URL
- **Keyboard shortcuts** — `←` / `→` navigate, `R` randomize, `D` toggle dark mode

## Getting started

You can run this project using Docker (recommended for a quick start) or by setting it up manually.

### Option 1: Docker (Recommended)

The easiest way to run FontPreview locally is using Docker Compose. It automatically provisions the PostgreSQL database, runs migrations, seeds the default fonts, and starts the Next.js app.

**Prerequisites:** Docker & Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/pwrobel03/font-preview-app
cd font-preview-app

# 2. Start the application
docker compose up -d
```

Once started, you can access the app at [http://localhost:3000](http://localhost:3000).

**Stopping the app:**
```bash
docker compose down
```

> [!NOTE]
> The Docker setup automatically creates the admin account using the following default credentials:
Email: admin@example.com
Password: change-me-before-seed

### Option 2: Manual Setup

**Prerequisites:** Node.js 18+, PostgreSQL

```bash
# 1. Clone and install
git clone https://github.com/pwrobel03/font-preview-app
cd font-preview-app
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
# Optionally set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD

# 3. Run migrations and seed
npx prisma migrate dev
npx prisma generate
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> [!IMPORTANT]
> When running manually, **always change the default credentials** in `.env` before running the seed.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Full base URL of the app (e.g. `http://localhost:3000`) |
| `SEED_ADMIN_EMAIL` | Email for the seeded admin account |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin account |

## Admin panel

Navigate to `/admin/login` and sign in with the admin credentials. From there you can:

- **Add a Google Font** — enter the display name and the exact name as it appears in Google Fonts
- **Upload a local font** — drag-and-drop or click to select a font file; it's stored under `public/fonts/`
- **Tag fonts** — inline tag editor with autocomplete suggestions
- **Toggle visibility** — mark fonts active or inactive without deleting them
- **Delete** — hover a row to reveal the delete button

![admin_panel](https://github.com/pwrobel03/font-preview-app/blob/main/public/images/admin_panel.png)

## Architecture

```
app/
  (public)/          # Public-facing pages (gallery, preview, compare, playground)
  admin/(panel)/     # Admin layout + fonts management (requires ADMIN role)
  api/               # REST endpoints for fonts and file upload
components/          # FontPreview, FontSelector (shared)
lib/
  font-loader.ts     # Injects Google Fonts <link> or @font-face for local files
  db.ts              # Prisma client singleton
prisma/
  schema.prisma      # Font, User, Session models
  seed.ts            # Seeds admin user + default Google Fonts
```

Authentication is handled by NextAuth.js v5 (Credentials provider, JWT strategy). The `(panel)` route group keeps the admin layout isolated from the public site and the login page.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with default fonts and admin user |
| `npm run db:studio` | Open Prisma Studio |
