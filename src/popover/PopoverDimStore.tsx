import { ReactNode, createContext, useMemo, useReducer } from 'react';

interface ActionType {
  id: string;
  status: boolean;
}

export interface PopoverDimContextProps {
  isDimmed: boolean;
  updatePopoverStatus: (action: ActionType) => void;
}

export const PopoverDimStoreContext = createContext<PopoverDimContextProps>({
  isDimmed: false,
  updatePopoverStatus(_param) {},
});

export interface PopoverDimStoreContextProviderProps {
  children: ReactNode;
}

const reducer = (prev: string[], action: ActionType) => {
  if (action.status) return [...prev, action.id];
  return prev.filter((popOverId) => popOverId !== action.id);
};

export const PopoverDimStoreContextProvider = ({ children }: PopoverDimStoreContextProviderProps) => {
  const [openedPopovers, updatePopoverStatus] = useReducer(reducer, null, () => []);
  const isDimmed = useMemo(() => openedPopovers.length !== 0, [openedPopovers]);

  return <PopoverDimStoreContext.Provider value={{ isDimmed, updatePopoverStatus }} children={children} />;
};
