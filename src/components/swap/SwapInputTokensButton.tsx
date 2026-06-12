interface SwapInputTokensButtonProps {
  onClick?: () => void;
}

export const SwapInputTokensButton = ({ onClick }: SwapInputTokensButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="h-full mx-auto border-2 py-2 px-5 m-2 rounded-xl cursor-pointer text-[16px] font-bold transition-all duration-300 hover:bg-hinkal-blue-900"
  >
    <i className="bi bi-arrow-down-up" />
  </button>
);
