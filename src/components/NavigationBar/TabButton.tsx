interface TabButtonProps {
  isActive: boolean;
  title: string;
  onClick: () => unknown;
  disabled?: boolean;
  disabledTooltip?: string;
}

export const TabButton = ({
  isActive,
  title,
  onClick,
  disabled,
  disabledTooltip,
}: TabButtonProps) => {
  if (disabled) {
    return (
      <div
        className="flex-1 text-hinkal-gray-300 pb-1 opacity-60 cursor-not-allowed"
        title={disabledTooltip}
      >
        <button
          type="button"
          disabled
          className="h-full flex gap-x-2 justify-center w-full bg-transparent border-none outline-none cursor-not-allowed"
        >
          {title}
        </button>
      </div>
    );
  }
  return (
    <div
      className={`${
        isActive
          ? "text-white border-b-primary border-b-[2px] pb-1"
          : "cursor-pointer hover:border-b-[2px] border-b-[#5f4ecd7b] text-hinkal-white-300 pb-1"
      } hover:border-b-[2px] flex-1 `}
    >
      <button
        type="button"
        className="h-full flex gap-x-2 justify-center w-full bg-transparent border-none outline-none"
        onClick={onClick}
      >
        {title}
      </button>
    </div>
  );
};
