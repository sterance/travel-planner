import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeContextProvider } from './theme/ThemeContext';
import { TripContextProvider } from './hooks/useTripContext';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <TripContextProvider>
          <App />
        </TripContextProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </StrictMode>,
);
