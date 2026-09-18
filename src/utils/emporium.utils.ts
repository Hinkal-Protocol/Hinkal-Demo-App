import { ethers } from "ethers";
import { Token } from "../types";
import { DeltaRow, OpRow } from "../components/emporium/types";

export const getTokenDecimals = (tokens: Token[], address: string) =>
  tokens.find(
    (t) => t.erc20TokenAddress.toLowerCase() === address.trim().toLowerCase(),
  )?.decimals ?? 18;

export const parseOpRow = (op: OpRow, index: number) => {
  const address = op.contract.trim();
  const signature = op.signature.trim();

  if (!ethers.isAddress(address))
    throw new Error(`op ${index + 1}: invalid contract address`);
  if (!signature)
    throw new Error(`op ${index + 1}: missing function signature`);

  let args: unknown[];
  try {
    const parsed = JSON.parse(op.args.trim() || "[]");
    if (!Array.isArray(parsed)) throw new Error("not an array");
    args = parsed;
  } catch {
    throw new Error(`op ${index + 1}: args must be a JSON array`);
  }

  let fragment: ethers.FunctionFragment;
  try {
    fragment = ethers.FunctionFragment.from(
      signature.startsWith("function ") ? signature : `function ${signature}`,
    );
  } catch {
    throw new Error(`op ${index + 1}: invalid function signature`);
  }

  return {
    address,
    signature,
    args,
    contract: new ethers.Contract(address, [fragment]),
    functionName: fragment.name,
  };
};

export const parseDeltaRows = (rows: DeltaRow[], tokens: Token[]) => {
  const tokenAddresses: string[] = [];
  const deltaAmounts: bigint[] = [];
  const described: string[] = [];

  rows.forEach((row, index) => {
    const address = row.token.trim();
    const rawAmount = row.amount.trim();
    if (!address && !rawAmount) return;

    if (!ethers.isAddress(address))
      throw new Error(`delta ${index + 1}: invalid token address`);
    if (!rawAmount) throw new Error(`delta ${index + 1}: missing amount`);

    const isNegative = rawAmount.startsWith("-");
    const magnitude = isNegative ? rawAmount.slice(1) : rawAmount;

    let units: bigint;
    try {
      units = ethers.parseUnits(magnitude, getTokenDecimals(tokens, address));
    } catch {
      throw new Error(`delta ${index + 1}: invalid amount`);
    }

    tokenAddresses.push(address);
    deltaAmounts.push(isNegative ? -units : units);
    described.push(`${address} ${isNegative ? "-" : "+"}${magnitude}`);
  });

  return { tokenAddresses, deltaAmounts, described };
};
