import { DeltaRow } from "./types";

interface DeltaFieldsProps {
  delta: DeltaRow;
  canRemove: boolean;
  onChange: (patch: Partial<DeltaRow>) => void;
  onRemove: () => void;
}

export const DeltaFields = ({
  delta,
  canRemove,
  onChange,
  onRemove,
}: DeltaFieldsProps) => (
  <div className="flex gap-x-2 items-end">
    <div className="flex-1">
      <label className="text-hinkal-white-300 text-xs mb-1 block">
        Token address
      </label>
      <input
        className="w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors"
        placeholder="0x..."
        value={delta.token}
        onChange={(e) => onChange({ token: e.target.value })}
      />
    </div>

    <div className="w-28">
      <label className="text-hinkal-white-300 text-xs mb-1 block">Amount</label>
      <input
        className="w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors"
        placeholder="-0.05"
        value={delta.amount}
        onChange={(e) => onChange({ amount: e.target.value })}
      />
    </div>

    {canRemove && (
      <button
        type="button"
        className="text-xs text-primary hover:text-hinkal-lavender-100 bg-transparent border-none cursor-pointer disabled:opacity-40 transition-colors pb-3"
        onClick={onRemove}
        aria-label="Remove token delta"
      >
        ×
      </button>
    )}
  </div>
);
