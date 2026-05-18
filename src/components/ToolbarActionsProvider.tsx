import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { ToolbarActionsContext, type ToolbarActionsContextValue } from "../contexts/ToolbarActionsContext";

interface ToolbarActionsProviderProps {
  children: ReactNode;
}

export const ToolbarActionsProvider = ({ children }: ToolbarActionsProviderProps): ReactElement => {
  const [actions, setActions] = useState<ReactNode>(null);
  const [onShare, setOnShareState] = useState<(() => void) | null>(null);
  const [shareDisabled, setShareDisabled] = useState(true);

  const setOnShare = useCallback((handler: (() => void) | null) => {
    setOnShareState(() => handler);
  }, []);

  const value = useMemo<ToolbarActionsContextValue>(() => {
    return {
      actions,
      setActions,
      onShare,
      setOnShare,
      shareDisabled,
      setShareDisabled,
    };
  }, [actions, onShare, setOnShare, shareDisabled]);

  return <ToolbarActionsContext.Provider value={value}>{children}</ToolbarActionsContext.Provider>;
};
