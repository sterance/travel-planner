import { createContext, useContext, useState, type ReactNode, type ReactElement } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light' && {
        background: {
          default: 'rgb(240, 246, 252)',
          paper: 'rgb(255, 255, 255)',
        },
        divider: 'rgba(0, 0, 0, 0.08)',
      }),
    },
    components: {
      MuiCssBaseline: {},
    },
  });

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps): ReactElement => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = (): void => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={(muiTheme) => ({
            ':root': {
              '--number-field-text-color': muiTheme.palette.text.primary,
              '--number-field-border-color': muiTheme.palette.divider,
              '--number-field-button-bg': muiTheme.palette.action.hover,
              '--number-field-button-bg-hover': muiTheme.palette.action.selected,
              '--number-field-focus-outline': muiTheme.palette.primary.main,
            },
          })}
        />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
