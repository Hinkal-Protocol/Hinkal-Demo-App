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

export enum ScheduleDelayOption {
  INSTANTLY = "Instantly",
  FIFTEEN_MINUTES = "15m",
  THIRTY_MINUTES = "30m",
  ONE_HOUR = "1hr",
  TWENTY_FOUR_HOURS = "24hrs",
}
