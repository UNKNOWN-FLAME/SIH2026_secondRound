import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ForecastingPage from './pages/ForecastingPage';
import GraphPage from './pages/GraphPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* Default Home immediately loads Page 3: AI Forecasting Engine */}
          <Route index element={<ForecastingPage />} />
          <Route path="forecasting" element={<ForecastingPage />} />
          <Route path="graph" element={<GraphPage />} />
          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
