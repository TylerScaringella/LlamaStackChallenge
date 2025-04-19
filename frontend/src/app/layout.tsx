import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientToaster } from "@/components/ClientToaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tariff Copilot",
  description: "AI-driven dashboard for trade optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <main className="min-h-screen bg-background">
          {children}
          <ClientToaster />
        </main>
      </body>
    </html>
  );
}
