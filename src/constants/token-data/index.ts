import arcTestnetRegistryJson from "./arcTestnetRegistry.json";
import ethMainnetRegistryJson from "./ethMainnetRegistry.json";
import arbMainnetRegistryJson from "./arbMainnetRegistry.json";
import polygonRegistryJson from "./polygonRegistry.json";
import optimismRegistryJson from "./optimismRegistry.json";
import baseRegistryJson from "./baseRegistry.json";
import solanaMainnetRegistryJson from "./solanaMainnetRegistry.json";
import tronNileRegistryJson from "./tronNileRegistry.json";
import tronMainnetRegistryJson from "./tronMainnetRegistry.json";
import { chainIds } from "../chains.constants";

const ethMainnetRegistry = ethMainnetRegistryJson.networkRegistry;
const arbMainnetRegistry = arbMainnetRegistryJson.networkRegistry;
const polygonRegistry = polygonRegistryJson.networkRegistry;
const optimismRegistry = optimismRegistryJson.networkRegistry;
const baseRegistry = baseRegistryJson.networkRegistry;
const tronNileRegistry = tronNileRegistryJson.networkRegistry;
const tronMainnetRegistry = tronMainnetRegistryJson.networkRegistry;
const arcTestnetRegistry = arcTestnetRegistryJson.networkRegistry;
const solanaMainnetRegistry = solanaMainnetRegistryJson.networkRegistry;

export const getTokenData = (chainId: number) => {
  switch (chainId) {
    case chainIds.polygon:
      return polygonRegistry;

    case chainIds.arbMainnet:
      return arbMainnetRegistry;

    case chainIds.ethMainnet:
      return ethMainnetRegistry;

    case chainIds.optimism:
      return optimismRegistry;

    case chainIds.base:
      return baseRegistry;

    case chainIds.arcTestnet:
      return arcTestnetRegistry;

    case chainIds.solanaMainnet:
      return solanaMainnetRegistry;

    case chainIds.tronNile:
      return tronNileRegistry;

    case chainIds.tronMainnet:
      return tronMainnetRegistry;

    default:
      return [];
  }
};
