import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import MapPage from './pages/MapPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import SimulatorPage from './pages/SimulatorPage.jsx'

const PAGE_TITLES = {
  map:       'Follow the Money',
  projects:  'Discover Projects',
  simulator: 'Funding Strategy Simulator',
  history:   'Funding History',
}

export default function App() {
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [page, setPage]               = useState('map')
  const [collapsed, setCollapsed]     = useState(false)
  const [projects, setProjects]       = useState(null)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [historyOrg, setHistoryOrg]   = useState('Gates Foundation')

  const navigateToHistory = useCallback((orgName) => {
    setHistoryOrg(orgName)
    setPage('history')
  }, [])

  useEffect(() => {
    fetch('./flow-data.json')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
        // Load all projects in the background once main data is ready
        setProjectsLoading(true)
        fetch('./projects.json')
          .then(r => r.json())
          .then(p => { setProjects(p); setProjectsLoading(false) })
          .catch(() => setProjectsLoading(false))
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#070f1c' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '2px solid #2366c9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: '#475569', fontSize: 13 }}>Loading…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#070f1c' }}>
      <p style={{ color: '#f87171', fontSize: 13 }}>Failed to load data: {error}</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1829' }}>
      <Sidebar page={page} onNavigate={setPage} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          background: '#070f1c',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: '#e2eaf4', letterSpacing: '-0.2px' }}>
            {PAGE_TITLES[page]}
          </h1>
          <span style={{ fontSize: 11, color: '#334155' }}>
            OECD Private Philanthropy Dataset · 2020–2023
          </span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#0b1829' }}>
          {page === 'map'       && <MapPage       data={data} projects={projects} onNavigate={navigateToHistory} />}
          {page === 'projects'  && <ProjectsPage  data={data} projects={projects} projectsLoading={projectsLoading} />}
          {page === 'simulator' && <SimulatorPage data={data} projects={projects} projectsLoading={projectsLoading} />}
          {page === 'history'   && <HistoryPage   data={data} projects={projects} projectsLoading={projectsLoading} initialOrg={historyOrg} />}
        </main>
      </div>
    </div>
  )
}
