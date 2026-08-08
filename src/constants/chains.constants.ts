/**
 * Chain ids the app targets. Keep this aligned with the SDK's
 * HINKAL_SUPPORTED_CHAINS — adding an id here also requires a networkRegistry
 * entry, a token registry, and (for EVM) a SUPPORTED_CHAINS entry.
 */
export const chainIds = {
  polygon: 137,
  arbMainnet: 42161,
  ethMainnet: 1,
  base: 8453,
  bnbMainnet: 56,
  tempo: 4217,
  arcTestnet: 5042002,
  tronNile: 3448148188,
  tronMainnet: 728126428,
  solanaMainnet: 501,
};
