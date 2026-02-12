interface TabButtonProps {
  isActive: boolean;
  title: string;
  onClick: () => unknown;
}

export const TabButton = ({ isActive, title, onClick }: TabButtonProps) => (
  <div
    className={`${
      isActive
        ? "text-white border-b-primary border-b-[2px] pb-1"
        : "cursor-pointer hover:border-b-[2px] border-b-[#5f4ecd7b] text-[#bab9be] pb-1"
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
