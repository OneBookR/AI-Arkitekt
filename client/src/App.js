import React, { useState } from 'react';
import './App.css';

const FilesAnalyzed = ({ files }) => {
  return (
    <div className="files-analyzed">
      <h3>📁 Filer vi analyserade</h3>
      <div className="files-scrollable-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-name">{file.path || file}</span>
            {file.ext && <span className="file-ext">{file.ext}</span>}
          </div>
        ))}
      </div>
      <div className="files-summary">
        <strong>Totalt analyserade:</strong> {files.length} filer
      </div>
    </div>
  );
};

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [analysisMode, setAnalysisMode] = useState('file');
  const [dragOver, setDragOver] = useState(false);
  const [debugCurrentPage, setDebugCurrentPage] = useState(0);
  const [githubUser, setGithubUser] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  
  const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3002';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    setProgressStage('Laddar upp fil...');
    
    const formData = new FormData();
    formData.append('zipfile', file);
    
    try {
      setProgress(20);
      setProgressStage('Skickar till server...');
      
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      console.log('Upload response:', data);
      
      if (data.analysisId) {
        setProgress(30);
        setProgressStage('Startar analys...');
        
        const pollProgress = async () => {
          try {
            const progressRes = await fetch(`${API_BASE}/api/legacy-progress/${data.analysisId}`);
            const progressData = await progressRes.json();
            
            console.log('Progress data:', progressData);
            
            if (progressData.progress !== undefined) {
              setProgress(progressData.progress);
              setProgressStage(progressData.stage || 'Analyserar...');
              
              if (progressData.progress < 100) {
                setTimeout(pollProgress, 200);
              }
            }
          } catch (error) {
            console.error('Progress polling error:', error);
          }
        };
        
        setTimeout(pollProgress, 100);
      } else {
        let currentProgress = 30;
        const simulateProgress = () => {
          currentProgress += Math.random() * 20;
          if (currentProgress > 95) currentProgress = 95;
          setProgress(currentProgress);
          setProgressStage('Analyserar kod...');
          
          if (currentProgress < 95) {
            setTimeout(simulateProgress, 500);
          }
        };
        simulateProgress();
      }
      
      setResult(data);
      setProgress(100);
      setProgressStage('Klar!');
    } catch (error) {
      console.error('Upload error:', error);
    }
    
    setLoading(false);
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  const fetchUserRepos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/repos`, {
        credentials: 'include'
      });
      const data = await res.json();
      setUserRepos(data.repos || []);
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  };

  const handleGithubAnalysis = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setProgress(10);
    setProgressStage('Ansluter till GitHub...');
    
    try {
      setProgress(30);
      setProgressStage('Laddar repository...');
      
      const res = await fetch(`${API_BASE}/analyze-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repoUrl: selectedRepo.html_url })
      });
      const data = await res.json();
      
      console.log('GitHub analysis response:', data);
      
      setProgress(60);
      setProgressStage('Analyserar kod...');
      
      let currentProgress = 60;
      const simulateProgress = () => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 95) currentProgress = 95;
        setProgress(currentProgress);
        setProgressStage('Genererar förslag...');
        
        if (currentProgress < 95) {
          setTimeout(simulateProgress, 300);
        }
      };
      simulateProgress();
      
      setResult(data);
      setProgress(100);
      setProgressStage('Klar!');
    } catch (error) {
      console.error('GitHub analysis error:', error);
    }
    
    setLoading(false);
  };

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user`, {
          credentials: 'include'
        });
        if (res.ok) {
          const userData = await res.json();
          setGithubUser(userData);
          fetchUserRepos();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  const renderSuggestions = () => {
    if (!result?.suggestions) return null;

    return (
      <div className="suggestions">
        <h3>🚀 Förbättringsförslag (Rankade)</h3>
        {result.suggestions.map((suggestion, index) => (
          <div key={index} className={`suggestion ${suggestion.category.toLowerCase()}`}>
            <div className="suggestion-problem">
              <div className="problem-header">
                <span>🚨</span>
                <h5>Problem vi hittade</h5>
              </div>
              
              <div style={{marginBottom: '20px'}}>
                <h4 style={{color: '#fca5a5', marginBottom: '8px', fontSize: '1.2rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  {suggestion.category.toUpperCase()}-PROBLEM
                </h4>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <p style={{color: 'rgba(255,255,255,0.95)', margin: '0', fontSize: '0.9rem', fontWeight: '500'}}>
                    {suggestion.title.replace(/^Ersätt\s+/, '').replace(/\s+med.*$/, '')}
                  </p>
                </div>
              </div>
              
              <div style={{marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                  <span style={{fontSize: '16px'}}>🔍</span>
                  <strong style={{color: '#fca5a5', fontSize: '0.9rem'}}>Vad vi hittade:</strong>
                </div>
                <p style={{color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', lineHeight: '1.4', margin: '0'}}>
                  {suggestion.description}
                </p>
              </div>
              
              <div style={{marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                  <span style={{fontSize: '16px'}}>⚠️</span>
                  <strong style={{color: '#fca5a5', fontSize: '0.9rem'}}>Varför detta är problematiskt:</strong>
                </div>
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  borderLeft: '3px solid #ef4444',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}>
                  {(() => {
                    const getDetailedProblemExplanation = (category) => {
                      switch(category) {
                        case 'monitoring':
                          return 'Utan strukturerad övervakning har ni ingen aning om när er applikation går ner, blir långsam, eller får fel i produktion. När användare rapporterar problem kan ni inte snabbt identifiera orsaken eller förstå hur många som påverkas. Detta leder till längre driftstopp, frustrerade användare som lämnar er tjänst, och förlorat förtroende. Ni upptäcker kritiska problem först när skadan redan är skedd, istället för att få varningar innan användarna märker något. Varje minut av driftstopp kostar er pengar och kundförtroende.';
                        case 'analytics':
                          return 'Ni fattar produktbeslut baserat på gissningar istället för verklig användardata. Detta betyder att ni inte vet vilka funktioner som används mest, var användare stöter på problem, eller vilka fel som orsakar mest frustration. När användare rapporterar buggar kan ni inte spåra dem tillbaka till specifika kodavsnitt eller förstå hur ofta de inträffar. Ni bygger fel funktioner och missar kritiska problem som påverkar er tillväxt. Konkurrenter som använder data-driven utveckling kommer att överträffa er.';
                        case 'auth':
                          return 'Att hantera säkerhet själv är extremt riskabelt. Ni måste själva implementera och underhålla alla säkerhetsaspekter: lösenordshashing med rätt salt, sessionstimeouts, brute-force protection, CSRF-skydd, och säker lösenordsåterställning. En enda säkerhetsbrist i er kod kan exponera alla användares data och leda till GDPR-böter på miljontals kronor. Dessutom saknar ni moderna funktioner som tvåfaktorsautentisering och social login som användare förväntar sig, vilket gör att ni förlorar potentiella kunder till konkurrenter.';
                        case 'payments':
                          return 'Er betalningslösning begränsar er affärstillväxt kritiskt. Ni är låsta till grundläggande betalningsmetoder och missar 40-60% av potentiella kunder som förväntar sig moderna alternativ som Apple Pay, Google Pay, Swish, eller buy-now-pay-later tjänster som Klarna. Ni saknar också avancerad fraud detection vilket betyder att ni förlorar pengar på chargebacks och falska transaktioner. Varje missad betalning på grund av begränsade betalningsalternativ kostar er direkt i förlorade intäkter, och dålig betalningsupplevelse skadar ert varumärke permanent.';
                        case 'search':
                          return 'Grundläggande sökning frustrerar användare som inte kan hitta vad de letar efter. Utan relevans-ranking, fuzzy matching och intelligent förslag lämnar användare er plattform för konkurrenter med bättre sökupplevelse. Dålig sökning minskar konvertering, ökar bounce rate och skadar er SEO-ranking. Moderna användare förväntar sig Google-kvalitet på sökning överallt.';
                        case 'media':
                          return 'Lokal fillagring skapar flaskhalsar när ni växer. Utan CDN blir er applikation långsam för användare i andra geografiska områden. Ni saknar backup-strategier vilket innebär risk för dataförlust. Stora filer i databasen gör hela systemet långsammare och dyrare att driva. När trafiken ökar kommer er server att krascha under belastningen.';
                        case 'communication':
                          return 'Egen e-postserver innebär leveransproblem och spam-risk. Era viktiga meddelanden hamnar i spam-mappar eller levereras inte alls. Ni saknar avancerade funktioner som A/B-testning av e-post, automatiserade kampanjer och detaljerad analytics. Manuell hantering av kommunikation skalar inte och leder till missade affärsmöjligheter och dålig kundservice.';
                        default:
                          return 'Detta begränsar er tillväxt och skapar teknisk skuld som blir dyrare att fixa ju längre ni väntar. Konkurrenter som använder moderna lösningar kommer att överträffa er i prestanda, funktionalitet och användarupplevelse.';
                      }
                    };
                    
                    return (
                      <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', margin: '0', lineHeight: '1.5'}}>
                        {getDetailedProblemExplanation(suggestion.category)}
                      </p>
                    );
                  })()}
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                  <span style={{fontSize: '16px'}}>💰</span>
                  <strong style={{color: '#fca5a5', fontSize: '0.9rem'}}>Affärspåverkan:</strong>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '6px'
                }}>
                  <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', margin: '0', lineHeight: '1.4'}}>
                    {suggestion.category === 'monitoring' && 'Ni upptäcker problem först när kunder klagar. Varje driftstopp kostar förlorade kunder och intakter.'}
                    {suggestion.category === 'analytics' && 'Ni fattar produktbeslut baserat på gissningar istället för data, vilket leder till lägre konvertering och tillväxt.'}
                    {suggestion.category === 'auth' && 'En säkerhetsbrist kan kosta miljoner i GDPR-böter och förlorat kundförtroende.'}
                    {suggestion.category === 'payments' && 'Ni förlorar 40-60% av potentiella kunder som förväntar sig moderna betalningsalternativ.'}
                    {!['monitoring', 'analytics', 'auth', 'payments'].includes(suggestion.category) && 'Detta begränsar er konkurrenskraft och förmåga att skala verksamheten effektivt.'}
                  </p>
                </div>
              </div>
              
              <div className="badges">
                <span className="impact" style={{background: '#dc2626', fontSize: '0.75rem'}}>Impact: {suggestion.impact}/10</span>
                <span className="effort" style={{background: '#ea580c', fontSize: '0.75rem'}}>Effort: {suggestion.effort}/10</span>
              </div>
            
              {suggestion.currentSituation && (
                <div style={{marginTop: '16px'}}>
                  <strong style={{color: '#fca5a5'}}>Vad vi hittade i din kod:</strong>
                  <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '8px'}}>
                    {suggestion.currentSituation.implementation}
                  </p>
                </div>
              )}
              
              <div style={{marginTop: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                  <span style={{fontSize: '16px'}}>📁</span>
                  <strong style={{color: '#fca5a5', fontSize: '0.9rem'}}>Berörda filer:</strong>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {(() => {
                    console.log('Suggestion object:', suggestion);
                    console.log('affectedFiles:', suggestion.affectedFiles);
                    console.log('codeExamples:', suggestion.currentSituation?.codeExamples);
                    return null;
                  })()}
                  {suggestion.affectedFiles && suggestion.affectedFiles.length > 0 ? (
                    <div>
                      {suggestion.affectedFiles.slice(0, 4).map((fileInfo, idx) => {
                        const fileName = typeof fileInfo === 'string' ? fileInfo : fileInfo.file;
                        const lineNumber = typeof fileInfo === 'object' ? fileInfo.lineNumber : null;
                        const codeSnippet = typeof fileInfo === 'object' ? fileInfo.codeSnippet : null;
                        
                        return (
                          <div key={idx} style={{
                            marginBottom: '8px',
                            background: 'rgba(220, 38, 38, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '4px',
                            padding: '6px 8px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '4px'
                            }}>
                              <span style={{color: '#ef4444', fontSize: '12px'}}>📄</span>
                              <span style={{
                                color: '#fca5a5',
                                fontSize: '0.8rem',
                                fontFamily: 'Monaco, monospace',
                                fontWeight: '600'
                              }}>
                                {fileName ? fileName.split('/').pop() : 'Okänd fil'}
                              </span>
                              {lineNumber && (
                                <span style={{
                                  color: 'rgba(255,255,255,0.6)',
                                  fontSize: '0.7rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  padding: '2px 6px',
                                  borderRadius: '3px'
                                }}>
                                  rad {lineNumber}
                                </span>
                              )}
                            </div>
                            {(codeSnippet || (suggestion.currentSituation?.codeExamples && suggestion.currentSituation.codeExamples[idx])) && (
                              <div style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                padding: '6px 8px',
                                borderRadius: '3px',
                                marginTop: '4px'
                              }}>
                                <code style={{
                                  color: 'rgba(255,255,255,0.9)',
                                  fontSize: '0.7rem',
                                  fontFamily: 'Monaco, monospace',
                                  lineHeight: '1.3'
                                }}>
                                  {(() => {
                                    const code = codeSnippet || suggestion.currentSituation.codeExamples[idx];
                                    return code && code.length > 60 ? code.substring(0, 60) + '...' : code;
                                  })()}
                                </code>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {suggestion.affectedFiles.length > 4 && (
                        <div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', textAlign: 'center'}}>
                          +{suggestion.affectedFiles.length - 4} fler filer med liknande problem...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic'}}>
                      Inga filer identifierade
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="suggestion-solution">
              <div className="solution-header">
                <span>✅</span>
                <h5>Lösningar vi rekommenderar</h5>
              </div>
              
              {suggestion.providers && suggestion.providers.length > 0 ? (
                <div className="providers-list">
                  {suggestion.providers.map((provider, pIndex) => (
                    <div key={pIndex} className="provider-card" style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                        <h6 style={{color: '#86efac', margin: '0', fontSize: '1rem', fontWeight: '600'}}>
                          {provider.name}
                        </h6>
                        <span style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem'}}>
                          ({provider.company})
                        </span>
                      </div>
                      <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: '8px 0'}}>
                        {provider.description}
                      </p>
                      <div style={{display: 'flex', gap: '12px', marginBottom: '8px'}}>
                        <span style={{background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem'}}>
                          {provider.pricing}
                        </span>
                        <span style={{background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem'}}>
                          ROI: {provider.roi}
                        </span>
                      </div>
                      <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{
                        color: '#86efac',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Läs mer →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{color: 'rgba(255,255,255,0.7)', fontStyle: 'italic'}}>Inga specifika leverantörer tillgängliga</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };



  const renderCodeSnippets = () => {
    if (!result?.codeSnippets?.length) return null;

    return (
      <div className="code-snippets">
        <h3>💻 Färdiga Kodsnippets (Låg-hänger-frukter)</h3>
        {result.codeSnippets.map((snippet, index) => (
          <div key={index} className="snippet">
            <h4>{snippet.title}</h4>
            <p>{snippet.description}</p>
            <pre><code>{snippet.code}</code></pre>
            {snippet.envVars?.length > 0 && (
              <div className="env-vars">
                <strong>Miljövariabler:</strong> {snippet.envVars.join(', ')}
              </div>
            )}
            {snippet.dependencies?.length > 0 && (
              <div className="dependencies">
                <strong>Dependencies:</strong> {snippet.dependencies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMarketplace = () => {
    if (!result?.marketplace?.length) return null;

    return (
      <div className="marketplace-section">
        <h3>🏪 Rekommenderade API:er & Tjänster</h3>
        <p>Baserat på din kodanalys rekommenderar vi dessa leverantörer:</p>
        
        {result.marketplace.map((category, categoryIndex) => (
          <div key={categoryIndex} className="marketplace-category">
            <h4>{category.category}</h4>
            <div className="providers-grid">
              {category.providers.map((provider, providerIndex) => (
                <div key={providerIndex} className="marketplace-provider">
                  <div className="provider-header">
                    <h5>{provider.name}</h5>
                    <span className="provider-company">({provider.company})</span>
                  </div>
                  
                  <p className="provider-description">{provider.description}</p>
                  
                  {provider.currentState && (
                    <div className="current-vs-upgrade">
                      <div className="current-state">
                        <h6>🚨 Nuvarande situation:</h6>
                        <p>Du {provider.currentState.description}</p>
                        <div className="problems">
                          <strong>Problem med nuvarande lösning:</strong>
                          <ul>
                            {provider.problemsWithCurrent?.map((problem, i) => (
                              <li key={i}>{problem}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="why-upgrade">
                        <h6>🚀 Varför uppgradera:</h6>
                        <p>{provider.whyUpgrade}</p>
                        <div className="specific-benefits">
                          <strong>Specifika fördelar för ditt projekt:</strong>
                          <ul>
                            {provider.specificBenefitsForYou?.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="provider-metrics">
                    <div className="metric">
                      <span className="label">Prissättning:</span>
                      <span className="value">{provider.pricing}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Affärsnytta:</span>
                      <span className="value">{provider.businessImpact}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Implementation:</span>
                      <span className="value">{provider.implementationTime}</span>
                    </div>
                    <div className="metric">
                      <span className="label">ROI:</span>
                      <span className="value">{provider.roi}</span>
                    </div>
                  </div>
                  
                  <div className="provider-actions">
                    <a 
                      href={provider.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="provider-link-btn"
                    >
                      Besök {provider.name} →
                    </a>
                    <span className={`complexity-badge complexity-${provider.complexity}`}>
                      {provider.complexity} komplexitet
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGDPRFlags = () => {
    if (!result?.gdprFlags?.length) return null;

    return (
      <div className="gdpr-flags">
        <h3>🔒 GDPR-kontroller</h3>
        {result.gdprFlags.map((flag, index) => (
          <div key={index} className={`gdpr-flag ${flag.severity}`}>
            <strong>{flag.type}:</strong> {flag.description || flag.pattern}
            <span className="file">{flag.file}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <header>
        <h1>🏗️ AI-Arkitekt</h1>
        <p>Ladda upp ditt projekt och få intelligenta förbättringsförslag</p>
        
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${analysisMode === 'file' ? 'active' : ''}`}
            onClick={() => setAnalysisMode('file')}
          >
            📁 Ladda upp ZIP
          </button>
          <button 
            className={`mode-btn ${analysisMode === 'github' ? 'active' : ''}`}
            onClick={() => setAnalysisMode('github')}
          >
            🐙 GitHub Repository
          </button>
        </div>
      </header>

      {analysisMode === 'file' ? (
        <div 
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p>Dra och släpp din ZIP-fil här eller</p>
            <input 
              type="file" 
              accept=".zip" 
              onChange={handleFileChange}
              id="file-input"
              style={{ display: 'none' }}
              value=""
            />
            <label htmlFor="file-input" className="file-button">
              Välj fil
            </label>
            {file && <p className="selected-file">Vald fil: {file.name}</p>}
          </div>
        </div>
      ) : (
        <div className="github-input-zone">
          <div className="github-content">
            <div className="github-icon">🐙</div>
            {!githubUser ? (
              <>
                <p>Logga in med GitHub för att välja repository</p>
                <button onClick={handleGithubLogin} className="github-login-btn">
                  🐙 Logga in med GitHub
                </button>
              </>
            ) : (
              <>
                <p>Välj repository att analysera ({githubUser.login})</p>
                <select 
                  value={selectedRepo?.id || ''}
                  onChange={(e) => {
                    const repo = userRepos.find(r => r.id === parseInt(e.target.value));
                    setSelectedRepo(repo);
                  }}
                  className="repo-select"
                >
                  <option value="">Välj repository...</option>
                  {userRepos.map(repo => (
                    <option key={repo.id} value={repo.id}>
                      {repo.name} {repo.private ? '(🔒 Private)' : '(🌍 Public)'}
                    </option>
                  ))}
                </select>
                {selectedRepo && (
                  <p className="selected-repo">
                    Valt: {selectedRepo.name} - {selectedRepo.description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={analysisMode === 'file' ? handleUpload : handleGithubAnalysis}
        disabled={loading || (analysisMode === 'file' ? !file : !selectedRepo)}
        className={`analyze-button ${loading ? 'loading' : ''}`}
        style={loading ? {
          background: `linear-gradient(to right, #007bff ${progress}%, #f8f9fa ${progress}%)`
        } : {}}
      >
        <span className="button-content">
          {loading ? `${progressStage} (${progress}%)` : `🚀 Analysera ${analysisMode === 'file' ? 'projekt' : 'repository'}`}
        </span>
      </button>

      {result && !loading && (
        <div className="results">
          {/* Debug section to show how code analysis works */}
          {(result.analysis?.currentImplementations || result.source === 'github') && (
            <div className="debug-analysis">
              <h3>🔍 Kodanalys Debug - Vad vi hittade i din kod</h3>
              {(() => {
                const itemsPerPage = 4;
                const items = result.analysis?.currentImplementations ? 
                  Object.entries(result.analysis.currentImplementations) : 
                  [['analys', { current: 'Analyserar GitHub-repository...', fileCount: 0, weakness: 'Kodmönster identifieras...' }]];
                
                const totalPages = Math.ceil(items.length / itemsPerPage);
                const currentItems = items.slice(debugCurrentPage * itemsPerPage, (debugCurrentPage + 1) * itemsPerPage);
                
                return (
                  <div className="debug-carousel">
                    <div className="debug-grid" style={{
                      transform: `translateX(0px)`,
                      width: '100%'
                    }}>
                      {currentItems.map(([category, info]) => (
                        <div key={category} className="debug-category">
                          <h4>{category.toUpperCase()}</h4>
                          <div className="current-impl">
                            <strong>Nuvarande:</strong> {info.current}
                          </div>
                          <div className="file-count">
                            <strong>Filer:</strong> {info.fileCount}
                          </div>
                          <div className="weakness">
                            <strong>Problem:</strong> {info.weakness}
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="debug-nav">
                        <button 
                          className="debug-nav-btn"
                          onClick={() => setDebugCurrentPage(Math.max(0, debugCurrentPage - 1))}
                          disabled={debugCurrentPage === 0}
                        >
                          ← Föregående
                        </button>
                        <span style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', alignSelf: 'center'}}>
                          {debugCurrentPage + 1} av {totalPages}
                        </span>
                        <button 
                          className="debug-nav-btn"
                          onClick={() => setDebugCurrentPage(Math.min(totalPages - 1, debugCurrentPage + 1))}
                          disabled={debugCurrentPage === totalPages - 1}
                        >
                          Nästa →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
          
          {(result.analysis?.projectSummary || result.analysis?.applicationPurpose) && (
            <div className="project-summary">
              <h3>🎯 Vad gör din kod?</h3>
              <p className="project-description">
                {result.analysis.applicationPurpose?.description || result.analysis.projectSummary?.description}
              </p>
              
              {result.analysis.applicationPurpose?.mainFeatures && (
                <div className="main-features">
                  <strong>Huvudfunktioner vi hittade:</strong>
                  <ul>
                    {result.analysis.applicationPurpose.mainFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.analysis.architecture && (
                <div className="architecture-summary">
                  <strong>Teknisk arkitektur:</strong>
                  <p>{result.analysis.architecture.pattern} med {result.analysis.architecture.layers?.join(', ')}</p>
                  {result.analysis.architecture.database && (
                    <p>Databas: {result.analysis.architecture.database}</p>
                  )}
                </div>
              )}
              
              {(result.analysis.projectSummary?.keyFeatures?.length > 0 || result.analysis.problems) && (
                <div className="key-features">
                  {result.analysis.projectSummary?.keyFeatures && (
                    <div>
                      <strong>Huvudfunktioner:</strong>
                      <div className="features-list">
                        {result.analysis.projectSummary.keyFeatures.map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.analysis.problems && (
                    <div className="identified-problems">
                      <strong>Identifierade problem:</strong>
                      <ul>
                        {result.analysis.problems.map((problem, index) => (
                          <li key={index} className={`problem-${problem.severity}`}>
                            <strong>{problem.title}</strong> - {problem.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="tech-metrics">
                <div className="metric">
                  <strong>Teknisk stack:</strong> {result.analysis.projectSummary.technicalStack?.join(', ') || 'Okänd'}
                </div>
                <div className="metric">
                  <strong>Kodstorlek:</strong> {result.analysis.projectSummary.codeMetrics?.totalLines?.toLocaleString()} rader
                </div>
                <div className="metric">
                  <strong>Komplexitet:</strong> {result.analysis.projectSummary.codeMetrics?.complexity}
                </div>
              </div>
            </div>
          )}
          
          {/* Files analyzed section */}
          {result.analysis?.files && (
            <FilesAnalyzed files={result.analysis.files} />
          )}
          
          <div className="analysis-summary">
            <h3>📊 Teknisk analys</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Språk:</strong> {result.analysis?.language}
              </div>
              <div className="summary-item">
                <strong>Ramverk:</strong> {result.analysis?.framework}
              </div>
              <div className="summary-item">
                <strong>Endpoints:</strong> {result.analysis?.endpoints?.length || 0}
              </div>
              <div className="summary-item">
                <strong>Filer:</strong> {result.analysis?.files?.length || 0}
              </div>
            </div>
          </div>

          {renderSuggestions()}
          {renderCodeSnippets()}
          {renderMarketplace()}
          {renderGDPRFlags()}
        </div>
      )}
    </div>
  );
}

export default App;