import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/Toast";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PersistAgent Dashboard",
  description: "Self-sustaining AI agent dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmMono.variable} ${geist.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-row" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <Sidebar />
        <main className="flex-1" style={{ background: "var(--color-bg)" }}>
          <ToastProvider>{children}</ToastProvider>
        </main>
      </body>
    </html>
  );
}
