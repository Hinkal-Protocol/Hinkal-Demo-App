import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import { useAppContext } from "../AppContext";
import { useShieldedUsdBalances } from "../hooks/useShieldedUsdBalances";

const formatUsd = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const BalanceSummary = () => {
  const { dataLoaded } = useAppContext();
  const { items, totalUsd, isLoading } = useShieldedUsdBalances();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      ({ token }) =>
        token.symbol.toLowerCase().includes(q) ||
        token.name.toLowerCase().includes(q) ||
        token.erc20TokenAddress.toLowerCase().includes(q),
    );
  }, [items, query]);

  if (!dataLoaded) return null;

  return (
    <div className="w-[90%] mx-auto mt-3 mb-1 flex items-center justify-between rounded-xl bg-hinkal-blue-900 px-4 py-3">
      <div className="flex flex-col">
        <span className="text-hinkal-white-300 text-[12px]">
          Private Balance
        </span>
        {isLoading ? (
          <span className="mt-1 h-7 w-24 rounded-md bg-hinkal-blue-300 animate-pulse" />
        ) : (
          <span className="text-white text-2xl font-semibold">
            {formatUsd(totalUsd)}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-hinkal-purple-200"
      >
        View
      </button>

      <Modal
        isOpen={open}
        xBtn
        xBtnAction={() => setOpen(false)}
        scrollBody={false}
        styleProps="md:!w-[420px] md:!left-[calc(50%-210px)]"
      >
        <div className="flex flex-col min-h-0 text-white font-generalSans">
          <p className="pt-3 pl-5 text-xl shrink-0">Balances</p>
          <div className="px-5 pt-3 shrink-0">
            <input
              type="text"
              autoFocus
              placeholder="Search by name, symbol or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-hinkal-blue-900 h-10 rounded-lg px-3 text-[14px] outline-none placeholder:text-[13px] placeholder:text-hinkal-gray-100"
            />
          </div>
          <div className="px-5 py-4 overflow-y-auto min-h-0 flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="text-hinkal-gray-100 text-sm text-center py-6">
                {items.length === 0 ? "No balances" : "No tokens found"}
              </p>
            ) : (
              filtered.map(({ token, amount, usdValue }) => (
                <div
                  key={token.erc20TokenAddress}
                  className="flex items-center gap-3"
                >
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-[30px] h-[30px] rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[15px]">{token.symbol}</span>
                    <span className="text-hinkal-gray-100 text-[12px]">
                      {token.name}
                    </span>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    <span className="text-[15px]">{amount.toFixed(4)}</span>
                    <span className="text-hinkal-gray-100 text-[12px]">
                      {formatUsd(usdValue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
