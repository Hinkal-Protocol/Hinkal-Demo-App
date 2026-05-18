/**
 * Pick which Tron chain the demo app targets.
 * Toggle USE_TRON_TESTNET to switch between Nile (testnet) and Mainnet.
 * Passed to `prepareTronHinkal` as `tronChainOverride` so the SDK seeds
 * the right chain maps regardless of how the SDK package was built.
 */
const USE_TRON_TESTNET = true;

export const TRON_MAINNET_CHAIN_ID = 728126428;
export const TRON_NILE_CHAIN_ID = 3448148188;

export const TRON_CHAIN_ID = USE_TRON_TESTNET
  ? TRON_NILE_CHAIN_ID
  : TRON_MAINNET_CHAIN_ID;
