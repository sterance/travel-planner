import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: { mode },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          overflowX: 'hidden',
          overscrollBehaviorX: 'none',
        },
        body: {
          overflowX: 'hidden',
          overscrollBehaviorX: 'none',
        },
      },
    },
  },
});
