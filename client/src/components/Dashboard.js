import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with API calls
    setProjects([
      { id: '1', name: 'Min Webbapp', createdAt: '2024-01-15' },
      { id: '2', name: 'E-handel Site', createdAt: '2024-01-10' }
    ]);
    
    setScans([
      { id: 's1', projectId: '1', status: 'done', findingsCount: 8 },
      { id: 's2', projectId: '2', status: 'running', findingsCount: 0 }
    ]);
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Laddar dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🏗️ AI-Arkitekt Dashboard</h1>
        <button className="new-project-btn">+ Nytt Projekt</button>
      </header>

      <div className="dashboard-grid">
        <div className="kpi-cards">
          <div className="kpi-card">
            <h3>Aktiva Projekt</h3>
            <div className="kpi-value">{projects.length}</div>
          </div>
          <div className="kpi-card">
            <h3>Senaste Scans</h3>
            <div className="kpi-value">{scans.filter(s => s.status === 'done').length}</div>
          </div>
          <div className="kpi-card">
            <h3>Totala Förslag</h3>
            <div className="kpi-value">{scans.reduce((sum, s) => sum + s.findingsCount, 0)}</div>
          </div>
        </div>

        <div className="recent-projects">
          <h2>Senaste Projekt</h2>
          <div className="project-list">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p>Skapad: {project.createdAt}</p>
                <div className="project-actions">
                  <button>Visa Scans</button>
                  <button>Ny Scan</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-scans">
          <h2>Senaste Scans</h2>
          <div className="scan-list">
            {scans.map(scan => (
              <div key={scan.id} className="scan-card">
                <div className="scan-status">
                  <span className={`status-badge ${scan.status}`}>
                    {scan.status === 'done' ? '✅' : '🔄'} {scan.status}
                  </span>
                </div>
                <div className="scan-info">
                  <p>Projekt: {projects.find(p => p.id === scan.projectId)?.name}</p>
                  {scan.status === 'done' && (
                    <p>{scan.findingsCount} förslag hittade</p>
                  )}
                </div>
                <button className="view-results-btn">
                  {scan.status === 'done' ? 'Visa Resultat' : 'Visa Status'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;