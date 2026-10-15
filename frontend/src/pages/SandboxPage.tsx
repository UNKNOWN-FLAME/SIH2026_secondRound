/**
 * Policy Sandbox — Route: /sandbox
 * Extends the existing SimulationPage with LMIS context awareness.
 * Receives district/trade/period context from Command Dashboard via navigation state.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLMIS } from '../context/LMISContext';
import SimulationPage from './SimulationPage';

export default function SandboxPage() {
  const location = useLocation();
  const { setTrade, setPeriod, setJurisdiction } = useLMIS();

  // Receive context passed from Command Dashboard "Jump to Sandbox" action
  useEffect(() => {
    const s = location.state as { district?: string; trade?: { code: string; label: string }; period?: string } | null;
    if (s?.trade) setTrade(s.trade);
    if (s?.period) setPeriod(s.period);
    if (s?.district) {
      setJurisdiction({ level: 'district', districtCode: s.district });
    }
  }, [location.state, setTrade, setPeriod, setJurisdiction]);

  return <SimulationPage />;
}
