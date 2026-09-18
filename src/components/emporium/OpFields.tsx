import { OpRow } from "./types";

interface OpFieldsProps {
  op: OpRow;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<OpRow>) => void;
  onRemove: () => void;
}

export const OpFields = ({
  op,
  index,
  canRemove,
  onChange,
  onRemove,
}: OpFieldsProps) => (
  <div className="flex flex-col gap-y-2 border border-hinkal-blue-900 rounded-lg p-3">
    <div className="flex justify-between items-center">
      <span className="text-white text-xs font-semibold">Op {index + 1}</span>
      {canRemove && (
        <button
          type="button"
          className="text-xs text-primary hover:text-hinkal-lavender-100 bg-transparent border-none cursor-pointer disabled:opacity-40 transition-colors"
          onClick={onRemove}
        >
          remove
        </button>
      )}
    </div>

    <label className="text-hinkal-white-300 text-xs mb-1 block">
      Contract address
    </label>
    <input
      className="w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors"
      placeholder="0x..."
      value={op.contract}
      onChange={(e) => onChange({ contract: e.target.value })}
    />

    <label className="text-hinkal-white-300 text-xs mb-1 block">
      Function signature
    </label>
    <input
      className="w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors"
      placeholder="transfer(address,uint256)"
      value={op.signature}
      onChange={(e) => onChange({ signature: e.target.value })}
    />

    <label className="text-hinkal-white-300 text-xs mb-1 block">
      Args (JSON array)
    </label>
    <input
      className="w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors"
      placeholder={'["0xRecipient...", "10000"]'}
      value={op.args}
      onChange={(e) => onChange({ args: e.target.value })}
    />
  </div>
);
