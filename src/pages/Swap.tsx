import {
  SetStateAction,
  SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { InfoPanel } from "../components/InfoPanel";
import { Spinner } from "../components/Spinner";
import { SelectToken } from "../components/swap/SelectToken";
import { SwapBalanceDisplay } from "../components/swap/SwapBalanceDisplay";
import { SwapInputTokensButton } from "../components/swap/SwapInputTokensButton";
import { SwapPriceDetails } from "../components/swap/SwapPriceDetails";
import { ERC20Token, getAmountInToken, getAmountInWei } from "@sabaaa1/common";
import { useUniswapPrice } from "../hooks/useUniswapPrice";
import { useAppContext } from "../AppContext";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  ERC20_ABI,
  UNISWAP_V3_ROUTER,
  UNISWAP_V3_ROUTER_ABI,
} from "../constants/swap.constants";

export const Swap = () => {
  const { hinkal, chainId } = useAppContext();

  const [inSwapAmount, setInSwapAmount] = useState("");
  const [inSwapToken, setInSwapToken] = useState<ERC20Token | undefined>(
    undefined
  );
  const [outSwapToken, setOutSwapToken] = useState<ERC20Token | undefined>(
    undefined
  );
  const [inSwapTokenBalance, setInSwapTokenBalance] = useState(0n);
  const [priceDetailsShown, setPriceDetailsShown] = useState(false);
  const [relayerInfoShown, setrelayerInfoShown] = useState(false);

  const {
    isPriceLoading,
    price: outSwapAmountWei,
    swapData: fee,
  } = useUniswapPrice({
    inSwapAmount,
    inSwapToken,
    outSwapToken,
  });

  const isReadyForSwap = useMemo(
    () =>
      inSwapAmount.length > 0 &&
      outSwapAmountWei &&
      outSwapAmountWei > 0n &&
      inSwapToken &&
      outSwapToken,
    [inSwapAmount, inSwapToken, outSwapToken]
  );

  const outSwapAmount = useMemo(
    () =>
      outSwapToken && outSwapAmountWei
        ? getAmountInToken(outSwapToken, outSwapAmountWei)
        : "",
    [outSwapAmountWei]
  );

  const { data: walletClient } = useWalletClient();

  const handleSwap = useCallback(async () => {
    try {
      if (!walletClient) return;

      if (!inSwapToken || !outSwapToken || !chainId) return;

      const provider = new ethers.providers.Web3Provider(
        walletClient.transport as any
      );
      const signer = provider.getSigner();

      const userAddress = await signer.getAddress();

      const amountIn = getAmountInWei(inSwapToken, inSwapAmount) ?? 0n;

      if (amountIn === 0n) return;

      const erc20 = new ethers.Contract(
        inSwapToken.erc20TokenAddress,
        ERC20_ABI,
        signer
      );

      const approveTx = await erc20.approve(UNISWAP_V3_ROUTER, amountIn);
      await approveTx.wait();

      const router = new ethers.Contract(
        UNISWAP_V3_ROUTER,
        UNISWAP_V3_ROUTER_ABI,
        signer
      );

      const params = {
        tokenIn: inSwapToken.erc20TokenAddress,
        tokenOut: outSwapToken.erc20TokenAddress,
        recipient: userAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        amountIn,
        amountOutMinimum: 1n,
        sqrtPriceLimitX96: 0n,
      };

      const swapTx = await router.exactInputSingle(params, {
        value: 0,
      });
      await swapTx.wait();
    } catch (err) {
      console.error("ERROR", err);
    }
  }, [walletClient, inSwapToken, outSwapToken, inSwapAmount, fee, chainId]);

  const setTokenAmountHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    setValue: (param: SetStateAction<string>) => void
  ) => {
    const regExp = /^[0-9]*[.]?[0-9]*$/;
    if (regExp.test(event.target.value)) {
      setValue(event.target.value);
    }
  };

  const swapButtonText = () => {
    // if (!swap) return "Connect Wallet";
    if (!inSwapToken || !outSwapToken) return "Select a token";
    if (Number(inSwapAmount) === 0 || Number(outSwapAmount) === 0)
      return "Enter an amount";
    return "Swap";
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <div className="flex mx-[4%] justify-between items-center text-xl font-[500] my-4">
        <p className="">Swap</p>
      </div>
      <div className="flex flex-col gap-y-1 mb-4">
        <div className="flex items-center justify-center bg-[#272B30] w-[96%] mx-auto rounded-xl py-5">
          <input
            type="text"
            placeholder="0"
            className="w-[96%] grow bg-transparent rounded-lg ml-[5%] text-[16px] pl-2 outline-none placeholder:text-[13.5px] text-white text-4xl placeholder:text-4xl "
            disabled={false}
            onChange={(event) => {
              setTokenAmountHandler(event, setInSwapAmount);
            }}
            value={inSwapAmount}
          />
          <div className="flex items-center grow gap-2 h-full min-w-fit">
            <button
              type="button"
              onClick={() =>
                setInSwapAmount(
                  `${Number(
                    inSwapToken
                      ? getAmountInToken(inSwapToken, inSwapTokenBalance)
                      : 0
                  ).toFixed(4)}`
                )
              }
            >
              MAX
            </button>
            <div className="flex flex-col gap-2 items-end justify-end grow max-w-fit">
              <SelectToken
                swapToken={inSwapToken}
                onTokenChange={(prev, cur) => {
                  setInSwapToken(cur);
                  if (
                    outSwapToken?.erc20TokenAddress === cur?.erc20TokenAddress
                  )
                    setOutSwapToken(prev);
                }}
                disabled={false}
              />
              <SwapBalanceDisplay
                token={inSwapToken}
                onBalanceChange={(balance: bigint) =>
                  setInSwapTokenBalance(balance)
                }
              />
            </div>
          </div>
        </div>
        <SwapInputTokensButton
          onClick={() => {
            setInSwapToken(outSwapToken);
            setOutSwapToken(inSwapToken);
          }}
        />
        <div className="bg-[#272B30] flex w-[96%] mx-auto rounded-xl py-5">
          <input
            type="text"
            placeholder="0"
            className="w-full grow bg-transparent rounded-lg ml-[5%] text-[16px] pl-2 outline-none placeholder:text-[13.5px] text-white text-4xl placeholder:text-4xl "
            disabled
            value={
              outSwapAmount === undefined || outSwapAmount.length === 0
                ? "0"
                : Number(outSwapAmount).toFixed(4)
            }
          />

          <div className="flex flex-col gap-2 items-end justify-end grow min-w-fit">
            <SelectToken
              swapToken={outSwapToken}
              onTokenChange={(prev, cur) => {
                setOutSwapToken(cur);
                if (inSwapToken?.erc20TokenAddress === cur?.erc20TokenAddress)
                  setInSwapToken(prev);
              }}
              disabled={false}
            />
            <SwapBalanceDisplay token={outSwapToken} />
          </div>
        </div>
        {(isReadyForSwap || isPriceLoading) && (
          <div
            onClick={() => setPriceDetailsShown((prev) => !prev)}
            className="bg-[#272B30] w-[96%] mx-auto rounded-xl py-5"
          >
            <div className="flex justify-between items-center mr-[6%]">
              <div className="mx-[6%] flex items-center gap-x-2">
                {isPriceLoading ? (
                  <div className="flex items-center gap-x-2">
                    <Spinner /> <span>Fetching best price</span>{" "}
                  </div>
                ) : (
                  <span>
                    {" "}
                    1 {outSwapToken?.symbol} ={"   "}
                    {(Number(inSwapAmount) / Number(outSwapAmount)).toFixed(4)}
                    {"   "}
                    {inSwapToken?.symbol}
                  </span>
                )}
              </div>
              <i
                className={`bi bi-chevron-${
                  priceDetailsShown ? "up" : "down"
                } font-bold`}
              />
            </div>
            {priceDetailsShown && !isPriceLoading && (
              <SwapPriceDetails
                outSwapAmount={"0"}
                outSwapToken={outSwapToken}
                setPriceDetailsShown={setPriceDetailsShown}
              />
            )}
          </div>
        )}
      </div>
      <div
        onClick={() => setPriceDetailsShown((prev) => !prev)}
        className="bg-[#272b3000] w-[88%] mx-auto rounded-xl py-1 flex items-center justify-between"
      >
        <InfoPanel
          cloudText="You will get less money after swap since a relayer takes 0.1% of
            amount, however the relayer pays slippage and gas costs."
          addTextRight="Swap with relayer"
          showDetails={relayerInfoShown}
          setShowDetails={setrelayerInfoShown}
        />
      </div>
      <div className="w-[90%] mx-auto mb-4 mt-[20px] h-[1px] bg-[#272B30]" />
      <div className="border-solid">
        <button
          type="button"
          disabled={swapButtonText() !== "Swap"}
          onClick={handleSwap}
          className={`w-[90%] ml-[5%] mb-3 md:mx-[5%] rounded-lg h-10 mt-3 text-sm font-semibold outline-none ${
            swapButtonText() === "Swap"
              ? "bg-primary text-white hover:bg-[#4d32fa] duration-200"
              : "bg-[#37363d] text-[#848688] cursor-not-allowed"
          } `}
        >
          {false ? (
            <div className="mx-[5%] flex items-center justify-center gap-x-2">
              <span>Swapping</span> <Spinner />
            </div>
          ) : (
            <span>{swapButtonText()}</span>
          )}
        </button>
      </div>
    </form>
  );
};
