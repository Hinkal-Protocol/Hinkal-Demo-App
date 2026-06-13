import { useState } from "react";
import {
  BasicHttpClient,
  chainIds,
  getScheduledTransactions,
  hashEthereumAddress,
  httpClient,
  setHinkalTronChainId,
} from "@hinkal/common";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import WalletManagerSolana from "@tetherto/wdk-wallet-solana";
import WalletManagerTron from "@tetherto/wdk-wallet-tron";

type WdkChain = "evm" | "solana" | "tron";

type PrivateSendParams = {
  token: string;
  recipient: string;
  amount: bigint;
};

// Shape of the internal helper the Solana WDK wallet exposes. Used here ONLY to
// read the shielded-derived ethereum address so we can poll the relayer for the
// scheduled withdraw status (the deposit hash returned by privateSend tells us
// nothing about whether the withdraw leg landed).
type SolanaHinkalBundle = {
  hinkal: {
    userKeys: { getDerivedEthereumAddress: () => string };
    getEthereumAddressByChain: (chainId: number) => Promise<string>;
    depositAndWithdraw: (
      erc20Token: unknown,
      amounts: bigint[],
      recipients: string[],
      txCompletionTime?: number,
    ) => Promise<string>;
  };
  erc20Token: unknown;
};

type PrivateSendAccount = {
  getAddress: () => Promise<string>;
  transferPrivate?: (options: PrivateSendParams) => Promise<{ hash: string }>;
  privateSend?: (options: PrivateSendParams) => Promise<{ hash: string }>;
  withdrawStuckUtxos?: (options: {
    token: string;
  }) => Promise<{ hashes: string[] }>;
  stuckUtxoBalances?: () => Promise<{ token: string; balance: bigint }[]>;
  _prepareHinkal?: (token: string) => Promise<SolanaHinkalBundle>;
};

const CHAIN_DEFAULTS: Record<
  WdkChain,
  { rpcUrl: string; token: string; amount: string }
> = {
  evm: {
    rpcUrl: "https://mainnet.optimism.io",
    token: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    amount: "1000000",
  },
  solana: {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    amount: "1000000",
  },
  tron: {
    rpcUrl: "https://nile.trongrid.io",
    token: "0xECa9bC828A3005B9a3b909f2cc5c2a54794DE05F",
    amount: "1000000",
  },
};

const TRON_NILE_RPC_HOSTS = ["nile.trongrid.io", "api.shasta.trongrid.io"];

const configureTronChain = (rpcUrl: string) => {
  const isNile = TRON_NILE_RPC_HOSTS.some((host) =>
    rpcUrl.toLowerCase().includes(host),
  );
  setHinkalTronChainId(
    isNile ? chainIds.tronNile : chainIds.tronMainnet,
  );
};

const PRIVATE_SEND_METHOD: Record<WdkChain, string> = {
  evm: "transferPrivate",
  solana: "privateSend",
  tron: "privateSend",
};

const TOKEN_PLACEHOLDER: Record<WdkChain, string> = {
  evm: "token address (0x...)",
  solana: "token mint (base58)",
  tron: "token address (TRC-20, T...)",
};

const RECIPIENT_PLACEHOLDER: Record<WdkChain, string> = {
  evm: "recipient address (0x...)",
  solana: "recipient (base58)",
  tron: "recipient (T...)",
};

const callPrivateSend = async (
  account: PrivateSendAccount,
  params: PrivateSendParams,
) => {
  if (typeof account.transferPrivate === "function") {
    return account.transferPrivate(params);
  }
  if (typeof account.privateSend === "function") {
    return account.privateSend(params);
  }
  throw new Error("Account has no private send method");
};

// Minimal harness to exercise WDK private send (Hinkal) for EVM, Solana, and Tron.
// Uses a throwaway seed phrase — never paste a real-funds seed here.
export const WdkTest = () => {
  const [chain, setChain] = useState<WdkChain>("evm");
  const [seed, setSeed] = useState("");
  const [token, setToken] = useState(CHAIN_DEFAULTS.evm.token);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(CHAIN_DEFAULTS.evm.amount);

  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  // RPC endpoint is fixed per chain (no UI override needed for the test harness).
  const rpcUrl = CHAIN_DEFAULTS[chain].rpcUrl;

  const switchChain = (nextChain: WdkChain) => {
    setChain(nextChain);
    setToken(CHAIN_DEFAULTS[nextChain].token);
    setAmount(CHAIN_DEFAULTS[nextChain].amount);
    setAddress("");
    setStatus("");
  };

  const accountFor = async (): Promise<PrivateSendAccount> => {
    const trimmedSeed = seed.trim();

    if (chain === "evm") {
      const wallet = new WalletManagerEvm(trimmedSeed, { provider: rpcUrl });
      return (await wallet.getAccount(0)) as PrivateSendAccount;
    }

    if (chain === "solana") {
      const wallet = new WalletManagerSolana(trimmedSeed, { provider: rpcUrl });
      return (await wallet.getAccount(0)) as PrivateSendAccount;
    }

    configureTronChain(rpcUrl);
    const wallet = new WalletManagerTron(trimmedSeed, { provider: rpcUrl });
    return (await wallet.getAccount(0)) as PrivateSendAccount;
  };

  const deriveAddress = async () => {
    setStatus("");
    try {
      const account = await accountFor();
      setAddress(await account.getAddress());
    } catch (err) {
      setStatus(`derive error: ${(err as Error).message}`);
    }
  };

  const sendPrivately = async () => {
    setBusy(true);
    setStatus("sending...");

    // The SDK talks to the relayer through @hinkal/common's httpClient (axios),
    // NOT window.fetch. We swap in a logging http client (setHttpClient is the
    // SDK's intended hook) to capture the exact body sent to /solana-transact-batch
    // and the relayer's raw response. The Solana withdraw fails async in the remote
    // relayer after the schedule POST returns OK, so this is the only place the
    // failing payload / any error message is visible client-side.
    const captured: string[] = [];
    const truncate = (v: unknown) => {
      const s = typeof v === "string" ? v : JSON.stringify(v);
      return s && s.length > 4000 ? `${s.slice(0, 4000)}…(truncated)` : s;
    };
    const base = new BasicHttpClient();
    const isRelayerUrl = (url: string) =>
      url.includes("solana-transact") || url.includes("transact-batch");
    const loggingClient = {
      get: base.get.bind(base),
      put: base.put.bind(base),
      patch: base.patch.bind(base),
      delete: base.delete.bind(base),
      post: async <T,>(url: string, data?: unknown, config?: unknown): Promise<T> => {
        const relayer = isRelayerUrl(url);
        if (relayer) captured.push(`>>> POST ${url}\n${truncate(data)}`);
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = await base.post<T>(url, data, config as any);
          if (relayer) captured.push(`<<< OK ${url}\n${truncate(res)}`);
          return res;
        } catch (e) {
          // axios errors carry the relayer's response body in e.response.data
          const ax = e as { response?: { status?: number; data?: unknown }; message?: string };
          if (relayer) {
            captured.push(
              `<<< ERROR ${url}\nstatus=${ax.response?.status}\nmessage=${ax.message}\ndata=${truncate(ax.response?.data)}`,
            );
          }
          throw e;
        }
      },
    };
    httpClient.setHttpClient(loggingClient as unknown as Parameters<typeof httpClient.setHttpClient>[0]);

    try {
      if (chain === "tron") configureTronChain(rpcUrl);
      const account = await accountFor();
      const result = await callPrivateSend(account, {
        token,
        recipient,
        amount: BigInt(amount),
      });
      setStatus(
        `OK: ${JSON.stringify(result)}\n\n=== RELAYER TRAFFIC ===\n${captured.join("\n\n") || "(none captured)"}`,
      );
    } catch (err) {
      const e = err as Error;
      setStatus(
        `FAILED: ${e.message}\n\n=== RELAYER TRAFFIC ===\n${captured.join("\n\n") || "(none captured)"}\n\nSTACK:\n${e.stack ?? "(no stack)"}`,
      );
    } finally {
      httpClient.setHttpClient(base);
      setBusy(false);
    }
  };

  // Polls the relayer for this account's scheduled Solana withdraws so we can
  // see WHERE the withdraw leg dies. privateSend only returns the deposit hash.
  // status FAILED -> relayer rejected; PENDING with far-future scheduledTime ->
  // txCompletionTime unit bug; COMPLETED with txHash -> it actually landed.
  const checkSolanaWithdrawStatus = async () => {
    setBusy(true);
    setStatus("checking withdraw status...");
    try {
      const account = await accountFor();
      if (typeof account._prepareHinkal !== "function") {
        throw new Error("Solana account has no _prepareHinkal");
      }
      const { hinkal } = await account._prepareHinkal(token);
      const derivedEth = hinkal.userKeys.getDerivedEthereumAddress();
      const hashed = hashEthereumAddress(derivedEth);
      const { transactions } = await getScheduledTransactions(true, hashed);
      const now = Math.floor(Date.now() / 1000);
      const lines = transactions.map((t) => {
        const sched = Number(t.scheduledTime);
        const drift = Number.isFinite(sched) ? sched - now : NaN;
        return `${t.status} | scheduledTime=${t.scheduledTime} (${drift}s from now) | amount=${t.amount} | tx=${t.transactionHash ?? "-"}`;
      });
      setStatus(
        `derivedEth=${derivedEth}\nscheduled (${transactions.length}):\n${lines.join("\n") || "(none)"}`,
      );
    } catch (err) {
      const e = err as Error;
      setStatus(`status check FAILED: ${e.message}\n\n${e.stack ?? ""}`);
    } finally {
      setBusy(false);
    }
  };

  // Lists shielded UTXOs awaiting recovery (left behind by failed withdraws).
  const checkStuckUtxos = async () => {
    setBusy(true);
    setStatus("checking stuck UTXOs...");
    try {
      const account = await accountFor();
      const balances = (await account.stuckUtxoBalances?.()) ?? [];
      setStatus(
        balances.length
          ? balances
              .map(({ token, balance }) => `${token}: ${balance.toString()}`)
              .join("\n")
          : "no stuck UTXOs",
      );
    } catch (err) {
      setStatus(`check FAILED: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  // Recovers UTXOs left shielded by a failed withdraw. The WDK always pays these
  // back to the wallet's own address (the sender), not a third-party recipient.
  const recoverStuckUtxos = async () => {
    setBusy(true);
    setStatus("recovering stuck UTXOs...");
    try {
      const account = await accountFor();
      const hashes =
        (await account.withdrawStuckUtxos?.({ token }))?.hashes ?? [];
      setStatus(
        hashes.length ? `recovered:\n${hashes.join("\n")}` : "no stuck UTXOs",
      );
    } catch (err) {
      setStatus(`recover FAILED: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full border rounded p-2 text-black";

  return (
    <div className="flex flex-col gap-2 p-4 text-white">
      <h2 className="text-lg font-bold">WDK private send test</h2>

      <div className="flex gap-2 flex-wrap">
        <button
          className={`rounded px-3 py-1 ${chain === "evm" ? "bg-blue-600" : "bg-gray-600"}`}
          onClick={() => switchChain("evm")}
          disabled={busy}
        >
          EVM
        </button>
        <button
          className={`rounded px-3 py-1 ${chain === "solana" ? "bg-blue-600" : "bg-gray-600"}`}
          onClick={() => switchChain("solana")}
          disabled={busy}
        >
          Solana
        </button>
        <button
          className={`rounded px-3 py-1 ${chain === "tron" ? "bg-blue-600" : "bg-gray-600"}`}
          onClick={() => switchChain("tron")}
          disabled={busy}
        >
          Tron
        </button>
      </div>

      <textarea
        className={field}
        placeholder="throwaway seed phrase (12/24 words)"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
      />
      <input
        className={field}
        placeholder={TOKEN_PLACEHOLDER[chain]}
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <input
        className={field}
        placeholder={RECIPIENT_PLACEHOLDER[chain]}
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        className={field}
        placeholder="amount (base units)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        className="bg-gray-600 rounded p-2"
        onClick={deriveAddress}
        disabled={busy}
      >
        Derive address (fund this)
      </button>
      {address && <div className="break-all">sender: {address}</div>}

      <button
        className="bg-blue-600 rounded p-2"
        onClick={sendPrivately}
        disabled={busy}
      >
        Send privately ({PRIVATE_SEND_METHOD[chain]})
      </button>

      {chain === "solana" && (
        <button
          className="bg-purple-600 rounded p-2"
          onClick={checkSolanaWithdrawStatus}
          disabled={busy}
        >
          Check withdraw status (Solana)
        </button>
      )}

      <button
        className="bg-amber-600 rounded p-2"
        onClick={checkStuckUtxos}
        disabled={busy}
      >
        Check stuck UTXOs
      </button>

      <button
        className="bg-amber-700 rounded p-2"
        onClick={recoverStuckUtxos}
        disabled={busy}
      >
        Recover stuck UTXOs 
      </button>

      {status && (
        <div className="break-all whitespace-pre-wrap font-mono text-xs">
          {status}
        </div>
      )}
    </div>
  );
};
