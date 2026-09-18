export type LogKind = "info" | "ok" | "err";

export type LogLine = { at: string; text: string; kind: LogKind };

export type OpRow = {
  contract: string;
  signature: string;
  args: string;
};

export type DeltaRow = { token: string; amount: string };

export const emptyOp: OpRow = { contract: "", signature: "", args: "[]" };
export const emptyDelta: DeltaRow = { token: "", amount: "" };
