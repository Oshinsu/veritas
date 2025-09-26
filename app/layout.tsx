import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OrionPulse",
  description: "Marketing intelligence copilot for MQ/GP/GF territories"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-br from-[#010308] via-[#030A1A] to-[#0B1733]">
          {children}
        </main>
      </body>
    </html>
  );
}
