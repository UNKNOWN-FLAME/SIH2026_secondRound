import { useEffect, useState } from 'react';
import { csrApi } from '../api/client';
import { Heart, TrendingUp, FileText, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CSRPage() {
  const [opportunities, setOpportunities] = useState<Record<string, unknown>[]>([]);
  const [dpr, setDpr] = useState<Record<string, unknown> | null>(null);
  const [sroi, setSroi] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'opportunities' | 'dpr' | 'sroi'>('opportunities');

  // DPR params
  const [districtCode, setDistrictCode] = useState('MH_PUNE');
  const [corporatePartner, setCorporatePartner] = useState('Tata Motors CSR Foundation');
  const [targetNco, setTargetNco] = useState('7231.0200');

  // SROI params
  const [csrGrantLakhs, setCsrGrantLakhs] = useState(45);
  const [annualTrainees, setAnnualTrainees] = useState(300);
  const [baselineWage, setBaselineWage] = useState(12000);
  const [certifiedWage, setCertifiedWage] = useState(26000);
  const [tenureYears, setTenureYears] = useState(5);

  useEffect(() => {
    csrApi.getOpportunities()
      .then(res => setOpportunities(res.data))
      .catch(() => toast.error('Failed to load CSR data'))
      .finally(() => setLoading(false));
  }, []);

  const generateDpr = async () => {
    try {
      const res = await csrApi.generateBankableDPR({ district_code: districtCode, corporate_partner: corporatePartner, target_nco_code: targetNco });
      setDpr(res.data);
      setTab('dpr');
      toast.success('DPR generated!');
    } catch { toast.error('DPR generation failed'); }
  };

  const calculateSroi = async () => {
    try {
      const res = await csrApi.calculateSROI({
        csr_grant_lakhs: csrGrantLakhs,
        annual_trainees: annualTrainees,
        baseline_monthly_wage: baselineWage,
        post_certified_monthly_wage: certifiedWage,
        tenure_years: tenureYears,
      });
      setSroi(res.data);
      setTab('sroi');
      toast.success('SROI calculated!');
    } catch { toast.error('SROI calculation failed'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">CSR & Private Capex "Skill-Bounty" Co-Investment Matchmaker</h1>
          <p className="page-subtitle">
            Strategic Innovation 8 — Matches Section 135 CSR budgets to high-deficit trades with captive hiring pledges
          </p>
        </div>
        <span className="badge badge-green">💼 CSR Engine</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'opportunities' ? 'active' : ''}`} onClick={() => setTab('opportunities')}>Opportunities</button>
        <button className={`tab ${tab === 'dpr' ? 'active' : ''}`} onClick={() => setTab('dpr')}>Generate DPR</button>
        <button className={`tab ${tab === 'sroi' ? 'active' : ''}`} onClick={() => setTab('sroi')}>SROI Calculator</button>
      </div>

      {tab === 'opportunities' && (
        loading ? <div className="loading-overlay"><div className="spinner" /><p>Loading CSR opportunities...</p></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {opportunities.map((opp: Record<string, unknown>, i: number) => (
              <div key={i} className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{String(opp.district_name || opp.target_district || '')}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-primary)', marginTop: 4 }}>{String(opp.trade_title || opp.target_trade || '')}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-blue">{String(opp.sector_code || '')}</span>
                      <span className="badge badge-red">Deficit: {Number(opp.deficit_headcount || 0).toLocaleString()}</span>
                      <span className="badge badge-green">SROI: {Number(opp.sroi_multiplier || 0).toFixed(2)}x</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-warning)' }}>
                        ₹{Number(opp.recommended_csr_grant_lakhs || 0).toLocaleString()} L
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Rec. CSR Grant</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-success)' }}>
                        {Number(opp.annual_training_capacity || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Annual Trainees</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
                        {Number(opp.captive_hiring_commitment_pct || 0)}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Hiring Pledge</div>
                    </div>
                  </div>
                </div>
                {Boolean(opp.corporate_match_suggestions) && (
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Suggested Corporate Partners: </span>
                    {(opp.corporate_match_suggestions as string[]).map((s, si) => (
                      <span key={si} className="badge badge-cyan" style={{ marginLeft: 4, fontSize: 10 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {opportunities.length === 0 && (
              <div className="empty-state"><Heart size={48} /><p>No CSR opportunities loaded.</p></div>
            )}
          </div>
        )
      )}

      {tab === 'dpr' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <FileText size={16} style={{ color: 'var(--color-primary)' }} /> Generate Bankable DPR & Term Sheet
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Target District</label>
                <input className="input" value={districtCode} onChange={e => setDistrictCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Corporate Partner</label>
                <input className="input" value={corporatePartner} onChange={e => setCorporatePartner(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target NCO Code</label>
                <input className="input" value={targetNco} onChange={e => setTargetNco(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={generateDpr}>
              <FileText size={15} /> Generate DPR
            </button>
          </div>

          {dpr && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">📄 Detailed Project Report</div>
                <span className="badge badge-green">Ready to Sign</span>
              </div>
              <div className="code-block" style={{ color: 'var(--color-text)', background: 'var(--color-surface-2)', maxHeight: 500 }}>
                {JSON.stringify(dpr, null, 2)}
              </div>
            </div>
          )}

          {!dpr && <div className="empty-state"><FileText size={48} /><p>Fill in the details and generate a DPR.</p></div>}
        </>
      )}

      {tab === 'sroi' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <Calculator size={16} style={{ color: 'var(--color-warning)' }} /> Social Return on Investment (SROI) Calculator
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">CSR Grant (₹ Lakhs)</label>
                <input className="input" type="number" min={1} value={csrGrantLakhs} onChange={e => setCsrGrantLakhs(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Trainees</label>
                <input className="input" type="number" min={10} value={annualTrainees} onChange={e => setAnnualTrainees(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Baseline Monthly Wage (₹)</label>
                <input className="input" type="number" min={5000} value={baselineWage} onChange={e => setBaselineWage(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Post-Certification Wage (₹)</label>
                <input className="input" type="number" min={10000} value={certifiedWage} onChange={e => setCertifiedWage(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tenure Years</label>
                <input className="input" type="number" min={1} max={10} value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={calculateSroi}>
              <Calculator size={15} /> Calculate SROI
            </button>
          </div>

          {sroi && (
            <div className="grid-4">
              {Object.entries(sroi).filter(([k]) => !k.includes('_') || true).map(([key, val], i) => (
                <div key={i} className="stat-card green">
                  <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: 20 }}>
                    {typeof val === 'number' ? val.toLocaleString('en-IN') : String(val)}
                  </div>
                  <div className="stat-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                </div>
              ))}
            </div>
          )}

          {!sroi && <div className="empty-state"><Calculator size={48} /><p>Enter SROI parameters and calculate.</p></div>}
        </>
      )}
    </div>
  );
}
