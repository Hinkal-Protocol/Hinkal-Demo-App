import arcTestnetRegistryJson from "./arcTestnetRegistry.json";
import ethMainnetRegistryJson from "./ethMainnetRegistry.json";
import arbMainnetRegistryJson from "./arbMainnetRegistry.json";
import polygonRegistryJson from "./polygonRegistry.json";
import baseRegistryJson from "./baseRegistry.json";
import bnbMainnetRegistryJson from "./bnbMainnetRegistry.json";
import tempoRegistryJson from "./tempoRegistry.json";
import solanaMainnetRegistryJson from "./solanaMainnetRegistry.json";
import tronNileRegistryJson from "./tronNileRegistry.json";
import tronMainnetRegistryJson from "./tronMainnetRegistry.json";
import { chainIds } from "../chains.constants";
import { Token } from "../../types";

const ethMainnetRegistry = ethMainnetRegistryJson.networkRegistry as Token[];
const arbMainnetRegistry = arbMainnetRegistryJson.networkRegistry as Token[];
const polygonRegistry = polygonRegistryJson.networkRegistry as Token[];
const baseRegistry = baseRegistryJson.networkRegistry as Token[];
const bnbMainnetRegistry = bnbMainnetRegistryJson.networkRegistry as Token[];
const tempoRegistry = tempoRegistryJson.networkRegistry as Token[];
const tronNileRegistry = tronNileRegistryJson.networkRegistry as Token[];
const tronMainnetRegistry = tronMainnetRegistryJson.networkRegistry as Token[];
const arcTestnetRegistry = arcTestnetRegistryJson.networkRegistry as Token[];
const solanaMainnetRegistry =
  solanaMainnetRegistryJson.networkRegistry as Token[];

export const getTokenData = (chainId: number): Token[] => {
  switch (chainId) {
    case chainIds.polygon:
      return polygonRegistry;

    case chainIds.arbMainnet:
      return arbMainnetRegistry;

    case chainIds.ethMainnet:
      return ethMainnetRegistry;

    case chainIds.base:
      return baseRegistry;

    case chainIds.bnbMainnet:
      return bnbMainnetRegistry;

    case chainIds.tempo:
      return tempoRegistry;

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
