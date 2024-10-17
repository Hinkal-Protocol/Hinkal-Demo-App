import { Hinkal } from "@hinkal/common";
import { FC, ReactNode, createContext, useContext, useState } from "react";
import { Connector } from "wagmi";

type AppContextArgumnets = {
  hinkal: Hinkal<Connector>;
};

const hinkalInstance = new Hinkal<Connector>();

const AppContext = createContext<AppContextArgumnets>({
  hinkal: hinkalInstance,
});

type AppContextProps = { children: ReactNode };

export const AppContextProvider: FC<AppContextProps> = ({
  children,
}: AppContextProps) => {
  const [hinkal, setHinkal] = useState<Hinkal<Connector>>(hinkalInstance);

  return (
    <AppContext.Provider value={{ hinkal }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
