import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/admin/login");

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-tight text-ink shrink-0">
            Font<span className="text-accent">Preview</span>
          </Link>
          <span className="text-xs text-ink-muted font-sans px-2 py-0.5 rounded bg-surface-subtle border border-border">
            Admin
          </span>

          <nav className="flex items-center gap-0.5">
            <Link
              href="/admin/fonts"
              className="px-3 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
            >
              Fonts
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-ink-muted font-sans hidden sm:block">{session.user?.email}</span>
            <SignOutButton />
            <Link
              href="/"
              className="text-sm text-ink-muted hover:text-ink transition-colors font-sans"
            >
              ← Public site
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
