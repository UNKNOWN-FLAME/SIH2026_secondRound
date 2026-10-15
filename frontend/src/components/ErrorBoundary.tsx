import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0f1117',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: '#1a1d2e',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Application Render Issue Detected</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>An error occurred while mounting the component tree.</p>
              </div>
            </div>

            <div style={{
              background: '#0f1117',
              border: '1px solid #2e3350',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#f87171',
              fontFamily: 'monospace',
              maxHeight: '150px',
              overflowY: 'auto',
              marginBottom: '20px',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#4f8ef7', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#252839', color: '#94a3b8', border: '1px solid #2e3350',
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} /> Clear Session & Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
