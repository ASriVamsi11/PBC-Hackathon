"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createWalletAdapterSigner } from "./walletAdapter";
import { createPaidFetch } from "./paidApi";

export function useX402() {
  const { connected, publicKey, signTransaction } = useWallet();

  const signer = useMemo(() => {
    if (!connected || !publicKey || !signTransaction) return null;
    return createWalletAdapterSigner(publicKey.toBase58(), signTransaction);
  }, [connected, publicKey, signTransaction]);

  const paidFetch = useMemo(() => {
    if (!signer) return null;
    return createPaidFetch(signer);
  }, [signer]);

  return {
    connected,
    walletAddress: publicKey?.toBase58() ?? null,
    paidFetch,
    canPay: connected && !!paidFetch,
  };
}
