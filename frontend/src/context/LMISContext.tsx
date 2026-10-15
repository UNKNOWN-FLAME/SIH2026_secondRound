/**
 * LMIS Global Application State
 * Shared across all modules: Command Dashboard, Policy Sandbox, Skill Graph, etc.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Jurisdiction {
  level: 'national' | 'state' | 'district';
  stateCode?: string;
  stateName?: string;
  districtCode?: string;
  districtName?: string;
}

export interface AuthClaims {
  username: string;
  role: 'MSDE_PLANNER' | 'STATE_OFFICER' | 'ANALYST' | 'VIEWER';
  /** Placeholder: real RBAC is enforced server-side */
  isPlaceholder: true;
}

export interface LMISState {
  selectedJurisdiction: Jurisdiction;
  selectedTrade: { code: string; label: string } | null;
  selectedPeriod: string;
  authClaims: AuthClaims;
  /** True when a diagnostic modal is open */
  diagnosticTarget: { districtCode: string; districtName: string; stateCode?: string } | null;
}

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_JURISDICTION'; payload: Jurisdiction }
  | { type: 'SET_TRADE'; payload: { code: string; label: string } | null }
  | { type: 'SET_PERIOD'; payload: string }
  | { type: 'OPEN_DIAGNOSTIC'; payload: { districtCode: string; districtName: string; stateCode?: string } }
  | { type: 'CLOSE_DIAGNOSTIC' }
  | { type: 'RESET_TO_NATIONAL' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function lmisReducer(state: LMISState, action: Action): LMISState {
  switch (action.type) {
    case 'SET_JURISDICTION':
      return { ...state, selectedJurisdiction: action.payload };
    case 'SET_TRADE':
      return { ...state, selectedTrade: action.payload };
    case 'SET_PERIOD':
      return { ...state, selectedPeriod: action.payload };
    case 'OPEN_DIAGNOSTIC':
      return { ...state, diagnosticTarget: action.payload };
    case 'CLOSE_DIAGNOSTIC':
      return { ...state, diagnosticTarget: null };
    case 'RESET_TO_NATIONAL':
      return { ...state, selectedJurisdiction: { level: 'national' } };
    default:
      return state;
  }
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: LMISState = {
  selectedJurisdiction: { level: 'national' },
  selectedTrade: null,
  selectedPeriod: '2026-03',
  authClaims: {
    username: 'msde.planner',
    role: 'MSDE_PLANNER',
    isPlaceholder: true,
  },
  diagnosticTarget: null,
};

// ─── Context ────────────────────────────────────────────────────────────────

interface LMISContextValue {
  state: LMISState;
  setJurisdiction: (j: Jurisdiction) => void;
  setTrade: (t: { code: string; label: string } | null) => void;
  setPeriod: (p: string) => void;
  openDiagnostic: (target: { districtCode: string; districtName: string; stateCode?: string }) => void;
  closeDiagnostic: () => void;
  resetToNational: () => void;
}

const LMISContext = createContext<LMISContextValue | null>(null);

export function LMISProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(lmisReducer, initialState);

  const setJurisdiction = useCallback((j: Jurisdiction) => dispatch({ type: 'SET_JURISDICTION', payload: j }), []);
  const setTrade = useCallback((t: { code: string; label: string } | null) => dispatch({ type: 'SET_TRADE', payload: t }), []);
  const setPeriod = useCallback((p: string) => dispatch({ type: 'SET_PERIOD', payload: p }), []);
  const openDiagnostic = useCallback((target: { districtCode: string; districtName: string; stateCode?: string }) => dispatch({ type: 'OPEN_DIAGNOSTIC', payload: target }), []);
  const closeDiagnostic = useCallback(() => dispatch({ type: 'CLOSE_DIAGNOSTIC' }), []);
  const resetToNational = useCallback(() => dispatch({ type: 'RESET_TO_NATIONAL' }), []);

  return (
    <LMISContext.Provider value={{ state, setJurisdiction, setTrade, setPeriod, openDiagnostic, closeDiagnostic, resetToNational }}>
      {children}
    </LMISContext.Provider>
  );
}

export function useLMIS(): LMISContextValue {
  const ctx = useContext(LMISContext);
  if (!ctx) throw new Error('useLMIS must be used within <LMISProvider>');
  return ctx;
}
