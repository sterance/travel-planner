import { type ReactElement, type ReactNode } from "react";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const statusBadgeShadowPulse = keyframes`
  0%, 100% { box-shadow: var(--status-badge-shadow-min); }
  50% { box-shadow: var(--status-badge-shadow-max); }
`;

interface StatusBadgeProps {
  variant: "info" | "start" | "end" | "warning";
  visible?: boolean;
  children?: ReactNode;
  attachToText?: boolean;
}

export const StatusBadge = ({ variant, visible = true, children, attachToText = false }: StatusBadgeProps): ReactElement | null => {
  const renderBadge = (): ReactElement | null => {
    
    if (!visible) return null;

    const shadowColorMap = {
      info: (theme: { palette: { info: { main: string } } }) => theme.palette.info.main,
      warning: (theme: { palette: { warning: { main: string } } }) => theme.palette.warning.main,
      success: (theme: { palette: { success: { main: string } } }) => theme.palette.success.main,
    };

    return (
      <Box
        sx={(theme) => {
          const shadowColor = variant === "end" ? shadowColorMap.success(theme) : shadowColorMap[variant === "warning" ? "warning" : "info"](theme);
          const baseStyles = {
            position: "absolute" as const,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
            "--status-badge-shadow-min": `0 1px 4px ${shadowColor}80`,
            "--status-badge-shadow-max": `0 2px 8px ${shadowColor}CC`,
            boxShadow: "var(--status-badge-shadow-min)",
            animation: `${statusBadgeShadowPulse} 2.5s ease-in-out infinite`,
            top: attachToText ? -4 : 2,
            right: attachToText ? -6 : 2,
          };
          switch (variant) {
            case "info":
              return {
                ...baseStyles,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "info.main",
              };
            case "warning":
              return {
                ...baseStyles,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "warning.main",
              };
            case "start":
              return {
                ...baseStyles,
                width: 12,
                height: 12,
              };
            case "end":
              return {
                ...baseStyles,
                width: 12,
                height: 12,
              };
            default:
              return baseStyles;
          }
        }}
      >
        {(variant === "start" || variant === "end") && (
          variant === "start" ? <OutlinedFlagIcon sx={{ fontSize: 12, color: "info.main" }} /> : <CheckCircleIcon sx={{ fontSize: 12, color: "success.main" }} />
        )}
      </Box>
    );
  };

  const badge = renderBadge();

  if (children) {
    return (
      <Box sx={{ position: "relative" }}>
        {children}
        {badge}
      </Box>
    );
  }

  return badge;
};
