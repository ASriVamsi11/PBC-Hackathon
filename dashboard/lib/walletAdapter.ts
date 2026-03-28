import { VersionedTransaction } from "@solana/web3.js";
import {
  getTransactionEncoder,
  type Address,
  type Transaction,
  type TransactionPartialSigner,
  type SignatureBytes,
} from "@solana/kit";

type WalletSignFn = (tx: VersionedTransaction) => Promise<VersionedTransaction>;

/**
 * Bridges a @solana/wallet-adapter signTransaction function to the
 * @solana/kit TransactionPartialSigner interface expected by @x402/svm.
 */
export function createWalletAdapterSigner(
  publicKeyBase58: string,
  signTransaction: WalletSignFn,
): TransactionPartialSigner {
  const encoder = getTransactionEncoder();

  return {
    address: publicKeyBase58 as Address,
    async signTransactions(transactions: readonly Transaction[]) {
      return Promise.all(
        transactions.map(async (tx) => {
          // Encode the @solana/kit Transaction to wire-format bytes
          const bytes = encoder.encode(tx) as Uint8Array;
          // Deserialize as @solana/web3.js v1 VersionedTransaction
          const v1Tx = VersionedTransaction.deserialize(bytes);
          // Sign via wallet adapter
          const signedV1Tx = await signTransaction(v1Tx);
          // Find our signature by matching the public key position in the account list
          const keys = signedV1Tx.message.staticAccountKeys;
          const idx = keys.findIndex((k) => k.toBase58() === publicKeyBase58);
          const sig = signedV1Tx.signatures[idx >= 0 ? idx : 0];
          return {
            [publicKeyBase58 as Address]: sig as unknown as SignatureBytes,
          } as Readonly<Record<Address, SignatureBytes>>;
        }),
      );
    },
  };
}
