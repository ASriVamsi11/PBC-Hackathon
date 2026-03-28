"use client";

import { type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

// Buffer polyfill for browser
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  window.Buffer = window.Buffer || require("buffer").Buffer;
}

const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

export default function SolanaWalletProvider({ children }: { children: ReactNode }) {
  // Phantom and Solflare auto-register via Wallet Standard — no explicit adapters needed

  return (
    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
      <WalletProvider wallets={[]} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
