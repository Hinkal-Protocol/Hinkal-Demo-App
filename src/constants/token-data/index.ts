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
import { Token } from "../../types";

const ethMainnetRegistry = ethMainnetRegistryJson.networkRegistry as Token[];
const arbMainnetRegistry = arbMainnetRegistryJson.networkRegistry as Token[];
const polygonRegistry = polygonRegistryJson.networkRegistry as Token[];
const optimismRegistry = optimismRegistryJson.networkRegistry as Token[];
const baseRegistry = baseRegistryJson.networkRegistry as Token[];
const tronNileRegistry = tronNileRegistryJson.networkRegistry as Token[];
const tronMainnetRegistry = tronMainnetRegistryJson.networkRegistry as Token[];
const arcTestnetRegistry = arcTestnetRegistryJson.networkRegistry as Token[];
const solanaMainnetRegistry = solanaMainnetRegistryJson.networkRegistry as Token[];

export const getTokenData = (chainId: number): Token[] => {
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
