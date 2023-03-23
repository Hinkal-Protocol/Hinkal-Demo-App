import { usePopoverDimStore } from '../hooks';

export const PopoverDimProvider = () => {
  const { isDimmed } = usePopoverDimStore();
  return isDimmed ? <div className="fixed inset-0 bg-black opacity-70 z-10" /> : null;
};
