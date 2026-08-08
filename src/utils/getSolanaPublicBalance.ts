import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { networkRegistry } from "../constants/networkRegistry";
import { chainIds } from "../constants/chains.constants";
import { SOLANA_NATIVE_MINT } from "../constants/solana-chain.constants";

export const getSolanaPublicBalance = async (
  ownerAddress: string,
  mintAddress: string
): Promise<bigint | null> => {
  try {
    const endpoint = networkRegistry[chainIds.solanaMainnet].fetchRpcUrl;
    const connection = new Connection(endpoint, "confirmed");
    const owner = new PublicKey(ownerAddress);

    if (mintAddress === SOLANA_NATIVE_MINT) {
      const lamports = await connection.getBalance(owner);
      return BigInt(lamports);
    }

    const mint = new PublicKey(mintAddress);
    const responses = await Promise.all(
      [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].map((programId) =>
        connection
          .getParsedTokenAccountsByOwner(owner, { mint, programId })
          .catch(() => ({ value: [] }))
      )
    );

    return responses
      .flatMap((res) => res.value)
      .reduce((total, { account }) => {
        const raw = account.data.parsed?.info?.tokenAmount?.amount ?? "0";
        return total + BigInt(raw);
      }, 0n);
  } catch {
    console.log(
      `Failed to fetch Solana public balance for address ${ownerAddress}`
    );
    return null;
  }
};
