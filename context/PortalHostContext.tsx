import { createContext, useContext } from "react";
import { PortalHost } from "tamagui";

interface PortalHostContextType {
  portalHostName: string;
}

const PortalHostContext = createContext<PortalHostContextType | null>(null);

export const PortalHostProvider = ({
  portalHostName = "modal-sheet",
  children,
}: {
  portalHostName: string;
  children: React.ReactNode;
}) => (
  <PortalHostContext.Provider value={{ portalHostName }}>
    {children}
    <PortalHost name={portalHostName} />
  </PortalHostContext.Provider>
);

export const useMaybePortalHostContext = () => useContext(PortalHostContext);
