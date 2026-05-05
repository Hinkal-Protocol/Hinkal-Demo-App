export enum AppTab {
  Deposit,
  Transfer,
  Withdraw,
  Swap,
  MultiSend,
}

export type Network = {
  chainId: number;
  name: string;
  fetchRpcUrl: string;
};
