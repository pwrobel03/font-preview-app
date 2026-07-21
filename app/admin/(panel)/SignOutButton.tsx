"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm text-ink-muted hover:text-ink transition-colors font-sans"
    >
      Sign out
    </button>
  );
}
