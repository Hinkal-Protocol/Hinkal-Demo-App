import { chainIds } from "./chains.constants";

// Chains a private bridge can deliver to: each has Hinkal deposit addresses
// (receive vaults) that shield whatever lands in them.
export const BRIDGE_DESTINATION_CHAIN_IDS = [
  chainIds.base,
  chainIds.arbMainnet,
  chainIds.polygon,
  chainIds.bnbMainnet,
  chainIds.ethMainnet,
  chainIds.solanaMainnet,
  chainIds.tronMainnet,
];
