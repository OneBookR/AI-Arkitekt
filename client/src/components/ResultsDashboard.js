import React, { useState, useEffect } from 'react';

function ResultsDashboard({ scanId }) {
  const [findings, setFindings] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    impact: '',
    effort: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scanId) {
      fetchFindings();
    }
  }, [scanId, filters]);

  const fetchFindings = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.impact) params.append('impact', filters.impact);
      if (filters.effort) params.append('effort', filters.effort);

      const response = await fetch(`http://localhost:3000/api/scans/${scanId}/findings?${params}`);
      const data = await response.json();
      setFindings(data.findings || []);
    } catch (error) {
      console.error('Error fetching findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSnippet = async (findingId) => {
    try {
      const response = await fetch('http://localhost:3000/api/snippets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findingId, language: 'javascript' })
      });
      
      const data = await response.json();
      
      // Update finding with snippet
      setFindings(prev => prev.map(f => 
        f.id === findingId 
          ? { ...f, hasSnippet: true, snippetCode: data.code }
          : f
      ));
    } catch (error) {
      console.error('Error generating snippet:', error);
    }
  };

  const filteredFindings = findings.filter(finding =>
    finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finding.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topSuggestions = filteredFindings
    .filter(f => f.impact === 'high' && f.effort === 'low')
    .slice(0, 3);

  if (loading) {
    return <div className="loading">Laddar resultat...</div>;
  }

  return (
    <div className="results-dashboard">
      {/* Top Suggestions */}
      <div className="top-suggestions">
        <h2>🚀 Top Förslag (Hög Impact, Låg Ansträngning)</h2>
        <div className="suggestion-cards">
          {topSuggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <h3>{suggestion.title}</h3>
              <div className="badges">
                <span className="impact high">Impact: {suggestion.impact}</span>
                <span className="effort low">Effort: {suggestion.effort}</span>
              </div>
              <p>{suggestion.description}</p>
              <button 
                onClick={() => generateSnippet(suggestion.id)}
                className="generate-btn"
              >
                {suggestion.hasSnippet ? '✅ Kod Genererad' : '🔧 Generera Kod'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls">
        <div className="filters">
          <h3>Filter</h3>
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.category === 'ux'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.checked ? 'ux' : ''
                }))}
              />
              UX/Chat
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.category === 'business'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.checked ? 'business' : ''
                }))}
              />
              Business
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.category === 'devops'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.checked ? 'devops' : ''
                }))}
              />
              DevOps
            </label>
          </div>
        </div>
        
        <div className="search">
          <input
            type="text"
            placeholder="Sök förslag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Findings List */}
      <div className="findings-list">
        <h2>Alla Förslag ({filteredFindings.length})</h2>
        
        {filteredFindings.map(finding => (
          <div key={finding.id} className="finding-row">
            <div className="finding-info">
              <h3>{finding.title}</h3>
              <p>{finding.description}</p>
              <div className="finding-meta">
                <span className={`category ${finding.category}`}>
                  {finding.category}
                </span>
                <span className={`impact ${finding.impact}`}>
                  Impact: {finding.impact}
                </span>
                <span className={`effort ${finding.effort}`}>
                  Effort: {finding.effort}
                </span>
                <span className="confidence">
                  Confidence: {Math.round(finding.confidence * 100)}%
                </span>
              </div>
            </div>
            
            <div className="finding-actions">
              <button 
                onClick={() => generateSnippet(finding.id)}
                className="action-btn generate"
              >
                {finding.hasSnippet ? 'Visa Kod' : 'Generera'}
              </button>
              <button className="action-btn view">Visa</button>
              <button className="action-btn dismiss">Avfärda</button>
            </div>
          </div>
        ))}
      </div>

      {filteredFindings.length === 0 && (
        <div className="no-results">
          <p>Inga förslag hittades med nuvarande filter.</p>
        </div>
      )}
    </div>
  );
}

export default ResultsDashboard;