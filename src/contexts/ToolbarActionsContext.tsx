import { createContext, useContext, type ReactNode } from "react";

export interface ToolbarActionsContextValue {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
  onShare: (() => void) | null;
  setOnShare: (handler: (() => void) | null) => void;
  shareDisabled: boolean;
  setShareDisabled: (disabled: boolean) => void;
}

export const ToolbarActionsContext = createContext<ToolbarActionsContextValue | undefined>(undefined);

export const useToolbarActions = (): ToolbarActionsContextValue => {
  const value = useContext(ToolbarActionsContext);
  if (!value) {
    throw new Error("useToolbarActions must be used within ToolbarActionsProvider");
  }
  return value;
};
