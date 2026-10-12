import React from "react";

interface RecipientInputRowProps {
  addressValue: string;
  amountValue: string;
  onAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  addressPlaceholder?: string;
  amountPlaceholder?: string;
  /** Renders a remove control in its own slot. Omit for a single, fixed row. */
  onRemove?: () => void;
  removeLabel?: string;
}

export const RecipientInputRow: React.FC<RecipientInputRowProps> = ({
  addressValue,
  amountValue,
  onAddressChange,
  onAmountChange,
  disabled = false,
  addressPlaceholder = "Recipient address",
  amountPlaceholder = "0",
  onRemove,
  removeLabel = "Remove recipient",
}) => (
  <div className="flex items-center gap-2 w-[96%] mx-auto mb-3">
    <input
      type="text"
      placeholder={addressPlaceholder}
      className="flex-1 min-w-0 bg-hinkal-blue-900 h-12 rounded-lg text-[16px] px-3 outline-none placeholder:text-[13.5px] text-white"
      disabled={disabled}
      onChange={onAddressChange}
      value={addressValue}
    />
    <div className="flex items-center bg-hinkal-blue-900 h-12 rounded-lg px-3 min-w-[120px]">
      <input
        type="text"
        placeholder={amountPlaceholder}
        className="w-full bg-transparent outline-none text-white text-right"
        disabled={disabled}
        onChange={onAmountChange}
        value={amountValue}
      />
    </div>
    {/* Reserve the slot even without a handler so every row stays aligned. */}
    <div className="w-6 shrink-0 flex items-center justify-center">
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          title={removeLabel}
          onClick={onRemove}
          disabled={disabled}
          className="flex h-6 w-6 items-center justify-center rounded-full text-hinkal-gray-100 transition-colors duration-200 hover:bg-hinkal-gray-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
          </svg>
        </button>
      )}
    </div>
  </div>
);
