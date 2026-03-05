import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { ToolbarActionsContext, type ToolbarActionsContextValue } from "../contexts/ToolbarActionsContext";

interface ToolbarActionsProviderProps {
  children: ReactNode;
}

export const ToolbarActionsProvider = ({ children }: ToolbarActionsProviderProps): ReactElement => {
  const [actions, setActions] = useState<ReactNode>(null);

  const value = useMemo<ToolbarActionsContextValue>(() => {
    return {
      actions,
      setActions,
    };
  }, [actions, setActions]);

  return <ToolbarActionsContext.Provider value={value}>{children}</ToolbarActionsContext.Provider>;
};
