import { type ReactElement, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface StatusBadgeProps {
  variant: 'info' | 'start' | 'end' | 'warning';
  visible?: boolean;
  children?: ReactNode;
  attachToText?: boolean;
}

export const StatusBadge = ({ variant, visible = true, children, attachToText = false }: StatusBadgeProps): ReactElement | null => {
  
  const renderBadge = (): ReactElement | null => {
    if (!visible) return null;

    const baseStyles = {
      position: 'absolute' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.7,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      top: attachToText ? -4 : 2,
      right: attachToText ? -6 : 2,
    };

    switch (variant) {
      case 'info':
        return (
          <Box
            sx={{
              ...baseStyles,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'info.main',
            }}
          />
        );
      case 'warning':
        return (
          <Box
            sx={{
              ...baseStyles,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'warning.main',
            }}
          />
        );
      case 'start':
        return (
          <Box
            sx={{
              ...baseStyles,
              width: 12,
              height: 12,
            }}
          >
            <OutlinedFlagIcon sx={{ fontSize: 12, color: 'info.main' }} />
          </Box>
        );
      case 'end':
        return (
          <Box
            sx={{
              ...baseStyles,
              width: 12,
              height: 12,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
          </Box>
        );
    }
  };

  const badge = renderBadge();

  if (children) {
    return (
      <Box sx={{ position: 'relative' }}>
        {children}
        {badge}
      </Box>
    );
  }

  return badge;
};
