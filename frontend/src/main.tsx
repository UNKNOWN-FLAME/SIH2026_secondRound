import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LMISProvider } from './context/LMISContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LMISProvider>
        <App />
      </LMISProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
