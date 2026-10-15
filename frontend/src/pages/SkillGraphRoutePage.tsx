/**
 * Skill Graph — Route: /skill-graph
 * Extends the existing SkillGraphPage with LMIS context awareness.
 * Receives trade context from Command Dashboard "Jump to Skill Graph" action.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLMIS } from '../context/LMISContext';
import SkillGraphPage from './SkillGraphPage';

export default function SkillGraphRoutePage() {
  const location = useLocation();
  const { setTrade } = useLMIS();

  // Receive trade context from Command Dashboard
  useEffect(() => {
    const s = location.state as { sourceOccupation?: { code: string; label: string } | null; trade?: { code: string; label: string } | null } | null;
    // If source occupation is provided (saturated trade), set it as selected trade
    if (s?.sourceOccupation) setTrade(s.sourceOccupation);
    else if (s?.trade) setTrade(s.trade);
  }, [location.state, setTrade]);

  return <SkillGraphPage />;
}
