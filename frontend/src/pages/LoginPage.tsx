import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('secret');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem('lmis_token', res.data.access_token);
      toast.success('Welcome to LMIS Dashboard!');
      navigate('/');
    } catch {
      toast.error('Invalid credentials. Try admin / secret');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)',
            borderRadius: 16,
            margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28
          }}>🇮🇳</div>
          <h1 className="gradient-text">LMIS Dashboard</h1>
          <p>Ministry of Skill Development & Entrepreneurship</p>
          <p style={{ fontSize: 11, marginTop: 2, color: 'var(--color-text-muted)' }}>SIH Problem Statement PS-26246</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">
              <User size={12} style={{ display: 'inline', marginRight: 4 }} />
              Username
            </label>
            <input
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin or planner"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <div className="alert alert-blue" style={{ fontSize: 12 }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <div>
              <strong>Demo credentials:</strong> username: <code>admin</code> or <code>planner</code>, password: <code>secret</code>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18 }} />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--color-text-muted)' }}>
          Secured by MSDE RBAC | JWT Authentication<br />
          Version 1.0.0 | 4 Pilot Sectors
        </div>
      </div>
    </div>
  );
}
