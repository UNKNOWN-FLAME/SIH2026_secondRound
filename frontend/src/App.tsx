import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Shell
import ShellLayout from './components/ShellLayout';

// Auth
import LoginPage from './pages/LoginPage';

// Primary routes (new shell spec)
import CommandDashboard from './pages/CommandDashboard';
import DataHubPage from './pages/DataHubPage';
import SandboxPage from './pages/SandboxPage';
import SkillGraphRoutePage from './pages/SkillGraphRoutePage';

// Existing module pages (preserved)
import DemandPage from './pages/DemandPage';
import SupplyPage from './pages/SupplyPage';
import ForecastingPage from './pages/ForecastingPage';
import MismatchPage from './pages/MismatchPage';
import SkillGraphPage from './pages/SkillGraphPage';
import SimulationPage from './pages/SimulationPage';
import CurriculumPage from './pages/CurriculumPage';
import MobilityPage from './pages/MobilityPage';
import ObsolescencePage from './pages/ObsolescencePage';
import CSRPage from './pages/CSRPage';
import GatiShaktiPage from './pages/GatiShaktiPage';
import TaxonomyPage from './pages/TaxonomyPage';
import TendersPage from './pages/TendersPage';
import ExportsPage from './pages/ExportsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import MigrationPage from './pages/MigrationPage';
import LegoPage from './pages/LegoPage';
import DashboardPage from './pages/DashboardPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('lmis_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1d2e',
            color: '#e2e8f0',
            border: '1px solid #2e3350',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ShellLayout />
            </PrivateRoute>
          }
        >
          {/* ── Primary spec routes ── */}
          <Route index element={<CommandDashboard />} />
          <Route path="data-hub" element={<DataHubPage />} />
          <Route path="forecasting" element={<ForecastingPage />} />
          <Route path="sandbox" element={<SandboxPage />} />
          <Route path="skill-graph" element={<SkillGraphRoutePage />} />

          {/* ── Preserved existing routes ── */}
          <Route path="demand" element={<DemandPage />} />
          <Route path="supply" element={<SupplyPage />} />
          <Route path="mismatch" element={<MismatchPage />} />
          <Route path="skills" element={<SkillGraphPage />} />
          <Route path="simulation" element={<SimulationPage />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="mobility" element={<MobilityPage />} />
          <Route path="obsolescence" element={<ObsolescencePage />} />
          <Route path="csr" element={<CSRPage />} />
          <Route path="gati-shakti" element={<GatiShaktiPage />} />
          <Route path="taxonomy" element={<TaxonomyPage />} />
          <Route path="tenders" element={<TendersPage />} />
          <Route path="exports" element={<ExportsPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="migration" element={<MigrationPage />} />
          <Route path="lego" element={<LegoPage />} />
          {/* Legacy dashboard preserved at /legacy-dashboard */}
          <Route path="legacy-dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
