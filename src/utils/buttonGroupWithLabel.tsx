import React from "react";

interface ButtonGroupWithLabelProps {
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (option: string) => void;
  disabled?: boolean;
  showInfo?: boolean;
}

export const ButtonGroupWithLabel: React.FC<ButtonGroupWithLabelProps> = ({
  label,
  options,
  selected,
  onSelect,
  disabled = false,
  showInfo = true,
}) => (
  <div className="w-[96%] mx-auto mb-4">
    <div className="flex items-center gap-2 mb-3">
      <label className="text-[14px] font-[300]">{label}</label>
      {showInfo && <i className="bi bi-info-circle text-[12px]"></i>}
    </div>
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg text-sm font-[400] transition-colors ${
            selected === option
              ? "bg-[#E8E6FF] text-[#1a1b1f]"
              : "bg-[#272B30] text-white hover:bg-[#33383d]"
          }`}
        >
          {option === "instantly" ? "Instantly" : option}
        </button>
      ))}
    </div>
  </div>
);
