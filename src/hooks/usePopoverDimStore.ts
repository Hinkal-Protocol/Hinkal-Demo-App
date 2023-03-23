import { useContext } from 'react';
import { PopoverDimStoreContext } from '../popover/PopoverDimStore';

export const usePopoverDimStore = () => {
  const content = useContext(PopoverDimStoreContext);
  return content;
};
