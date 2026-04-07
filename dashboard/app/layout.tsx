import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/Toast";
import SolanaWalletProvider from "./components/WalletProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MintAI Dashboard",
  description: "Self-sustaining AI agent dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmMono.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-row" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <SolanaWalletProvider>
          <Sidebar />
          <main className="flex-1" style={{ background: "var(--color-bg)" }}>
            <ToastProvider>{children}</ToastProvider>
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
