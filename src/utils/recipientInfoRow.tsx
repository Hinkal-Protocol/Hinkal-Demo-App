import React from "react";

interface RecipientInputRowProps {
  addressValue: string;
  amountValue: string;
  onAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  addressPlaceholder?: string;
  amountPlaceholder?: string;
}

export const RecipientInputRow: React.FC<RecipientInputRowProps> = ({
  addressValue,
  amountValue,
  onAddressChange,
  onAmountChange,
  disabled = false,
  addressPlaceholder = "Recipient address",
  amountPlaceholder = "0",
}) => (
  <div className="flex items-center gap-2 w-[96%] mx-auto mb-3">
    <input
      type="text"
      placeholder={addressPlaceholder}
      className="flex-1 bg-[#272B30] h-12 rounded-lg text-[16px] px-3 outline-none placeholder:text-[13.5px] text-white"
      disabled={disabled}
      onChange={onAddressChange}
      value={addressValue}
    />
    <div className="flex items-center bg-[#272B30] h-12 rounded-lg px-3 min-w-[120px]">
      <input
        type="text"
        placeholder={amountPlaceholder}
        className="w-full bg-transparent outline-none text-white text-right"
        disabled={disabled}
        onChange={onAmountChange}
        value={amountValue}
      />
    </div>
  </div>
);
