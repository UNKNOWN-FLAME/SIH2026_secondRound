import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchOccupations,
  fetchSkillNetworkTopology,
  fetchBridgeRecommendations,
} from '../api/client';
import GraphHeader from '../components/skillgraph/GraphHeader';
import TransitionEconomicsStrip from '../components/skillgraph/TransitionEconomicsStrip';
import SkillNetworkCanvas from '../components/skillgraph/SkillNetworkCanvas';
import ModularCurriculumAddendum from '../components/skillgraph/ModularCurriculumAddendum';
import OfficialReskillingOrderModal from '../components/skillgraph/OfficialReskillingOrderModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GraphPage() {
  const [occupations, setOccupations] = useState([]);
  const [networkData, setNetworkData] = useState(null);
  const [sourceNco, setSourceNco] = useState('7231.0100'); // Legacy Diesel Mechanic default
  const [surplusCandidates, setSurplusCandidates] = useState(500);

  const [recommendationData, setRecommendationData] = useState(null);
  const [activePathway, setActivePathway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // 1. Initial Load: Occupations & Topology
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const [occsRes, networkRes] = await Promise.all([
          fetchOccupations(),
          fetchSkillNetworkTopology(),
        ]);
        if (!isMounted) return;

        setOccupations(occsRes || []);
        setNetworkData(networkRes || null);

        // If default 7231.0100 is present, keep it, else pick first legacy at-risk
        if (occsRes && occsRes.length > 0) {
          const defaultExists = occsRes.some((o) => o.nco_code === '7231.0100');
          if (!defaultExists) {
            const firstLegacy = occsRes.find((o) => o.is_legacy_at_risk);
            if (firstLegacy) setSourceNco(firstLegacy.nco_code);
            else setSourceNco(occsRes[0].nco_code);
          }
        }
      } catch (err) {
        console.error('Failed to load skill graph initial data:', err);
        // Fallback mocks
        setOccupations([
          { nco_code: '7231.0100', title: 'Automotive Diesel Mechanic', sector_code: 'GREEN_ENERGY', nsqf_level: 4, is_legacy_at_risk: true },
          { nco_code: '7231.0200', title: 'EV Powertrain & Battery Diagnostic Tech', sector_code: 'GREEN_ENERGY', nsqf_level: 4, is_emerging: true },
          { nco_code: '7411.0100', title: 'Solar PV Rooftop Installer', sector_code: 'GREEN_ENERGY', nsqf_level: 4, is_emerging: true },
          { nco_code: '8212.0100', title: 'Semiconductor SMT Assembly Technician', sector_code: 'ESDM', nsqf_level: 4, is_emerging: true },
          { nco_code: '4132.0100', title: 'Data Entry & Processing Clerk', sector_code: 'IT_ITES', nsqf_level: 4, is_legacy_at_risk: true },
        ]);
        setNetworkData({
          nodes: [
            { id: '7231.0100', label: 'Automotive Diesel Mechanic', sector: 'GREEN_ENERGY', nsqf_level: 4, status: 'SURPLUS' },
            { id: '7231.0200', label: 'EV Battery Diagnostic Tech', sector: 'GREEN_ENERGY', nsqf_level: 4, status: 'SHORTAGE' },
            { id: '7411.0100', label: 'Solar PV Rooftop Installer', sector: 'GREEN_ENERGY', nsqf_level: 4, status: 'SHORTAGE' },
            { id: '8212.0100', label: 'Semiconductor SMT Technician', sector: 'ESDM', nsqf_level: 4, status: 'SHORTAGE' },
            { id: '4132.0100', label: 'Data Entry & Processing Clerk', sector: 'IT_ITES', nsqf_level: 4, status: 'SURPLUS' },
          ],
          edges: [
            { source: '7231.0100', target: '7231.0200', overlap_pct: 78.0, bridge_weeks: 4 },
            { source: '7231.0100', target: '7411.0100', overlap_pct: 64.0, bridge_weeks: 6 },
            { source: '7231.0100', target: '8212.0100', overlap_pct: 52.0, bridge_weeks: 8 },
          ],
        });
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load Bridge Recommendations whenever sourceNco or surplusCandidates changes
  const loadRecommendations = useCallback(async () => {
    if (!sourceNco) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchBridgeRecommendations(sourceNco, surplusCandidates);
      setRecommendationData(data);
      if (data?.adjacent_transition_pathways?.length > 0) {
        setActivePathway(data.adjacent_transition_pathways[0]);
      } else {
        setActivePathway(null);
      }
    } catch (err) {
      console.error('Failed to load bridge recommendations:', err);
      setError('Could not fetch graph bridge recommendations. Backend service might be warming up.');
    } finally {
      setLoading(false);
    }
  }, [sourceNco, surplusCandidates]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecommendations();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadRecommendations]);

  const currentTradeTitle =
    occupations.find((o) => o.nco_code === sourceNco)?.title || 'Selected Saturated Trade';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Primary Graph Content (Hidden in Print when order modal is open) */}
      <div className={`space-y-6 ${isOrderModalOpen ? 'print:hidden' : ''}`}>
        {/* 1. Header with Origin Trade & Surplus Slider */}
        <GraphHeader
          occupations={occupations}
          sourceNco={sourceNco}
          setSourceNco={setSourceNco}
          surplusCandidates={surplusCandidates}
          setSurplusCandidates={setSurplusCandidates}
          activePathway={activePathway}
          loading={loading}
        />

        {/* Error alert if any */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadRecommendations}
              className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* 2. Transition Economics & Public Funds Saved Strip */}
        <TransitionEconomicsStrip
          recommendationData={recommendationData}
          activePathway={activePathway}
          surplusCandidates={surplusCandidates}
          loading={loading}
        />

        {/* 3. Interactive Competency Topology Canvas */}
        <SkillNetworkCanvas
          networkData={networkData}
          sourceNco={sourceNco}
          targetNco={activePathway?.target_nco_code}
          onSelectNode={(nodeId) => setSourceNco(nodeId)}
          loading={loading}
        />

        {/* 4. The 30-Day Modular Bridge Curriculum Addendum Breakdown */}
        <ModularCurriculumAddendum
          pathways={recommendationData?.adjacent_transition_pathways || []}
          activePathway={activePathway}
          onSelectPathway={(p) => setActivePathway(p)}
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
          loading={loading}
        />
      </div>

      {/* 5. Statutory Reskilling Order Modal Preview */}
      <OfficialReskillingOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        sourceTradeTitle={currentTradeTitle}
        sourceNcoCode={sourceNco}
        activePathway={activePathway}
        surplusCandidates={surplusCandidates}
      />
    </div>
  );
}
