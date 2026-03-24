// Phase 6 — Agent boot sequence
// 1. Upload identity JSON to Filecoin → get identityCID
// 2. Check on-chain registry — if not registered, call registerAgent(name, identityCID)
// 3. Load previous memory index CID from registry (if exists)
// 4. Start Express server, begin accepting paid requests
export async function boot(): Promise<void> {
  throw new Error("boot.ts not yet implemented — see Phase 6");
}
