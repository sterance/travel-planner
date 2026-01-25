import { type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TripPage } from './pages/TripPage';

function App(): ReactElement {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/trip" replace />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="/test" element={<div>Test page</div>} />
      </Route>
    </Routes>
  );
}

export default App;
