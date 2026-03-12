import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Fines Manager 🍺",
  description: "Keep your team accountable — one fine at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
