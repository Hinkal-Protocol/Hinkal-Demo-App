import { toast } from "react-hot-toast";
import { Token } from "../../types";
import { Network } from "../../types";
import { getAmountInToken } from "../../utils/amount.utils";
import { Spinner } from "../Spinner";

const fieldClass =
  "w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors";
const labelClass = "text-hinkal-white-300 text-xs mb-1 block";
const linkButtonClass =
  "text-xs text-primary hover:text-hinkal-lavender-100 bg-transparent border-none cursor-pointer disabled:opacity-40 transition-colors";
const primaryButtonClass =
  "w-full bg-primary rounded-lg py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-x-2 hover:bg-hinkal-lavender-100 transition-colors";
const sectionTitleClass = "text-white font-semibold text-sm";

interface AccountPanelProps {
  networks: Network[];
  selectedChainId: number;
  onSelectChain: (chainId: number) => void;
  privateKey: string;
  onPrivateKeyChange: (value: string) => void;
  onConnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  ethAddress: string;
  balances: { token: Token; wei: bigint }[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AccountPanel = ({
  networks,
  selectedChainId,
  onSelectChain,
  privateKey,
  onPrivateKeyChange,
  onConnect,
  isConnecting,
  isConnected,
  ethAddress,
  balances,
  onRefresh,
  isRefreshing,
}: AccountPanelProps) => {
  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <span className={sectionTitleClass}>1. Hinkal account</span>

      <label className={labelClass}>Network</label>
      <select
        className={fieldClass}
        value={selectedChainId}
        onChange={(e) => onSelectChain(Number(e.target.value))}
        disabled={isConnected}
      >
        {networks.map((network) => (
          <option key={network.chainId} value={network.chainId}>
            {network.name}
          </option>
        ))}
      </select>

      {!isConnected ? (
        <>
          <label className={labelClass}>Private key</label>
          <input
            className={fieldClass}
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="0x..."
            value={privateKey}
            onChange={(e) => onPrivateKeyChange(e.target.value)}
          />
          <button
            type="button"
            className={primaryButtonClass}
            disabled={!privateKey.trim() || isConnecting}
            onClick={onConnect}
          >
            {isConnecting && <Spinner styleSize="size-5 mr-0" />}
            Create account
          </button>
        </>
      ) : (
        <>
          <div>
            <span className={labelClass}>Deposit address</span>
            <button
              type="button"
              className="w-full text-left bg-hinkal-blue-200 rounded px-3 py-2 text-white break-all text-xs cursor-pointer border-none hover:bg-hinkal-blue-900 transition-colors"
              onClick={() => copy(ethAddress, "Address")}
              title="Click to copy"
            >
              {ethAddress}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className={labelClass}>Shielded balance</span>
            <button
              type="button"
              className={linkButtonClass}
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? "refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="flex flex-col gap-y-1">
            {balances.length === 0 ? (
              <span className="text-hinkal-white-300 text-xs">empty</span>
            ) : (
              balances.map(({ token, wei }) => (
                <div
                  key={token.erc20TokenAddress}
                  className="flex justify-between text-xs text-white"
                >
                  <button
                    type="button"
                    className="bg-transparent border-none text-white cursor-pointer hover:text-primary transition-colors"
                    title="Click to copy token address"
                    onClick={() =>
                      copy(token.erc20TokenAddress, `${token.symbol} address`)
                    }
                  >
                    {token.symbol}
                  </button>
                  <span>{getAmountInToken(token, wei)}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
