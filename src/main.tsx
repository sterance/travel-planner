import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeContextProvider } from './theme/ThemeContext';
import { TripContextProvider } from './context/TripContext';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';

// #region agent log
window.addEventListener('unhandledrejection', (event) => {
  fetch('http://127.0.0.1:7243/ingest/08b58cc9-c8af-4ac5-80a7-c8ceff160cde',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:unhandledrejection',message:'unhandled promise rejection',data:{reason:event.reason instanceof Error?event.reason.message:String(event.reason),stack:event.reason instanceof Error?event.reason.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
});
// #endregion

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
