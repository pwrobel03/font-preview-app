import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Font Preview",
  description: "Internal tool for previewing and comparing web fonts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  );
}
