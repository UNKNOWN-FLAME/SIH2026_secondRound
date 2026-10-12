import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchDistricts,
  fetchSectors,
  fetchOccupations,
  fetchTradeForecastTrajectory,
  fetchModelMetrics,
} from '../api/client';
import ForecastingHeader from '../components/forecasting/ForecastingHeader';
import DeficitSummaryStrip from '../components/forecasting/DeficitSummaryStrip';
import ForecastFanChart from '../components/forecasting/ForecastFanChart';
import MacroShockControls from '../components/forecasting/MacroShockControls';
import ModelMetricsCard from '../components/forecasting/ModelMetricsCard';
import PolicyAdvisoryCard from '../components/forecasting/PolicyAdvisoryCard';
import ForecastingCircularModal from '../components/forecasting/ForecastingCircularModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ForecastingPage() {
  // Master Filter State
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [occupations, setOccupations] = useState([]);

  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('MH_PUNE');
  const [selectedSector, setSelectedSector] = useState('GREEN_ENERGY');
  const [selectedNco, setSelectedNco] = useState('7411.0100');
  const [horizonMonths, setHorizonMonths] = useState(12);

  // Macro-economic shock parameters
  const [capexBoostCr, setCapexBoostCr] = useState(0);
  const [inflationRatePct, setInflationRatePct] = useState(5.5);
  const [fdiInflowCr, setFdiInflowCr] = useState(0);
  const [stipendBoostPct, setStipendBoostPct] = useState(0);

  // Model Selection
  const [modelType, setModelType] = useState('ENSEMBLE');

  // Trajectory & Diagnostics Data
  const [forecastData, setForecastData] = useState(null);
  const [modelMetadata, setModelMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isCircularModalOpen, setIsCircularModalOpen] = useState(false);

  // Initial Load: Taxonomies
  useEffect(() => {
    let isMounted = true;
    async function loadTaxonomies() {
      try {
        const [districtsRes, sectorsRes, occsRes] = await Promise.all([
          fetchDistricts(),
          fetchSectors(),
          fetchOccupations(),
        ]);
        if (!isMounted) return;

        setDistricts(districtsRes || []);
        setSectors(sectorsRes || []);
        setOccupations(occsRes || []);

        if (districtsRes?.length > 0 && !districtsRes.find((d) => d.code === 'MH_PUNE')) {
          setSelectedDistrict(districtsRes[0].code);
        }
        if (sectorsRes?.length > 0 && !sectorsRes.find((s) => s.code === 'GREEN_ENERGY')) {
          setSelectedSector(sectorsRes[0].code);
        }
      } catch (err) {
        console.error('Failed to load initial taxonomies:', err);
        // Fallback robust mocks if backend offline
        setDistricts([
          { code: 'MH_PUNE', name: 'Pune', state_code: 'MH', tier: 1, industrial_focus: 'Automotive & ESDM' },
          { code: 'MH_NAGPUR', name: 'Nagpur', state_code: 'MH', tier: 2, industrial_focus: 'Solar Parks & MIHAN SEZ' },
          { code: 'UP_KANPUR', name: 'Kanpur', state_code: 'UP', tier: 2, industrial_focus: 'Defense Corridor & Electronics' },
          { code: 'UP_LUCKNOW', name: 'Lucknow', state_code: 'UP', tier: 2, industrial_focus: 'Healthcare & IT City' },
          { code: 'TN_CHENNAI', name: 'Chennai', state_code: 'TN', tier: 1, industrial_focus: 'Automotive & Mega ESDM' },
          { code: 'TN_COIMBATORE', name: 'Coimbatore', state_code: 'TN', tier: 2, industrial_focus: 'Precision Engineering & EV' },
        ]);
        setSectors([
          { code: 'GREEN_ENERGY', name: 'Renewable Energy & EV Mobility' },
          { code: 'ESDM', name: 'Electronics & Semiconductor ATMP' },
          { code: 'HEALTHCARE', name: 'Allied Healthcare & Emergency Tech' },
          { code: 'IT_ITES', name: 'Information Technology & Cloud Systems' },
        ]);
        setOccupations([
          { nco_code: '7411.0100', title: 'Solar PV Rooftop Installer', sector_code: 'GREEN_ENERGY', nsqf_level: 4, is_emerging: true },
          { nco_code: '7231.0200', title: 'EV Powertrain & Battery Diagnostic Tech', sector_code: 'GREEN_ENERGY', nsqf_level: 4, is_emerging: true },
          { nco_code: '7231.0100', title: 'Automotive Diesel Mechanic (Legacy)', sector_code: 'GREEN_ENERGY', nsqf_level: 4, is_legacy_at_risk: true },
          { nco_code: '3211.0100', title: 'Medical Dialysis Technician', sector_code: 'HEALTHCARE', nsqf_level: 5, is_emerging: true },
        ]);
      }
    }
    loadTaxonomies();
    return () => {
      isMounted = false;
    };
  }, []);

  // When sector changes, filter trades list or select first in sector
  const filteredOccupations = useMemo(() => {
    if (!selectedSector) return occupations;
    const inSector = occupations.filter((o) => o.sector_code === selectedSector);
    return inSector.length > 0 ? inSector : occupations;
  }, [occupations, selectedSector]);

  // Keep selectedNco valid when sector changes
  useEffect(() => {
    if (filteredOccupations.length > 0) {
      const exists = filteredOccupations.some((o) => o.nco_code === selectedNco);
      if (!exists) {
        setSelectedNco(filteredOccupations[0].nco_code);
      }
    }
  }, [filteredOccupations, selectedNco]);

  // Current Trade Detail Object
  const currentTradeDetails = useMemo(() => {
    return occupations.find((o) => o.nco_code === selectedNco) || null;
  }, [occupations, selectedNco]);

  // Fetch Trajectory Function
  const loadForecast = useCallback(async () => {
    if (!selectedDistrict || !selectedNco) return;
    setLoading(true);
    setError(null);

    try {
      const [trajectoryRes, metricsRes] = await Promise.all([
        fetchTradeForecastTrajectory({
          districtCode: selectedDistrict,
          ncoCode: selectedNco,
          horizonMonths,
          capexBoostCr,
          inflationRatePct,
          fdiInflowCr,
          stipendBoostPct,
          modelType,
        }),
        fetchModelMetrics().catch(() => null),
      ]);

      setForecastData(trajectoryRes);
      if (metricsRes) setModelMetadata(metricsRes);
    } catch (err) {
      console.error('Failed to fetch forecast trajectory:', err);
      setError('Unable to load AI forecasting trajectory from backend. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [
    selectedDistrict,
    selectedNco,
    horizonMonths,
    capexBoostCr,
    inflationRatePct,
    fdiInflowCr,
    stipendBoostPct,
    modelType,
  ]);

  // Debounced load when sliders or filters move
  useEffect(() => {
    const timer = setTimeout(() => {
      loadForecast();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadForecast]);

  const handleResetShocks = () => {
    setCapexBoostCr(0);
    setInflationRatePct(5.5);
    setFdiInflowCr(0);
    setStipendBoostPct(0);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Primary Dashboard Content (Hidden in Print when circular modal is open) */}
      <div className={`space-y-6 ${isCircularModalOpen ? 'print:hidden' : ''}`}>
        {/* 1. Demand-Supply Header */}
        <ForecastingHeader
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          districts={districts}
          sectors={sectors}
          occupations={filteredOccupations}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedNco={selectedNco}
          setSelectedNco={setSelectedNco}
          horizonMonths={horizonMonths}
          setHorizonMonths={setHorizonMonths}
          tradeDetails={currentTradeDetails}
          loading={loading}
        />

        {/* Error Banner if any */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadForecast}
              className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* 2. Critical Metric KPI Strip */}
        <DeficitSummaryStrip data={forecastData} loading={loading} />

        {/* 3. Core Stochastic Trajectory Fan Chart */}
        <ForecastFanChart
          data={forecastData}
          loading={loading}
          horizonMonths={horizonMonths}
        />

        {/* 4. Macro-Economic Stress Testing Sliders */}
        <MacroShockControls
          capexBoostCr={capexBoostCr}
          setCapexBoostCr={setCapexBoostCr}
          inflationRatePct={inflationRatePct}
          setInflationRatePct={setInflationRatePct}
          fdiInflowCr={fdiInflowCr}
          setFdiInflowCr={setFdiInflowCr}
          stipendBoostPct={stipendBoostPct}
          setStipendBoostPct={setStipendBoostPct}
          onReset={handleResetShocks}
          loading={loading}
        />

        {/* 5. Multi-Model Architecture & ML Diagnostics */}
        <ModelMetricsCard
          modelType={modelType}
          setModelType={setModelType}
          modelMetadata={modelMetadata || forecastData?.model_metadata}
          loading={loading}
        />

        {/* 6. Executive Policy Action Box & Circular Trigger */}
        <PolicyAdvisoryCard
          data={forecastData}
          onOpenCircularModal={() => setIsCircularModalOpen(true)}
          loading={loading}
        />
      </div>

      {/* 7. Official Gazette Circular Modal */}
      <ForecastingCircularModal
        isOpen={isCircularModalOpen}
        onClose={() => setIsCircularModalOpen(false)}
        data={forecastData}
      />
    </div>
  );
}
