const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'ai-arkitekt-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3002/auth/github/callback'
  }, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
  }));
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Auth routes
app.get('/auth/github', (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    // Mock login for development
    req.session.user = {
      id: 'mock-user',
      username: 'testuser',
      displayName: 'Test User',
      photos: [{ value: 'https://github.com/identicons/testuser.png' }],
      accessToken: 'mock-token'
    };
    return res.redirect('http://localhost:3000');
  }
  passport.authenticate('github', { scope: ['repo'] })(req, res);
});

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000' }),
  (req, res) => {
    res.redirect('http://localhost:3000');
  }
);

app.get('/api/user', (req, res) => {
  const user = req.user || req.session.user;
  if (user) {
    res.json({
      id: user.id,
      login: user.username,
      name: user.displayName,
      avatar_url: user.photos[0]?.value
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/api/user/repos', async (req, res) => {
  const user = req.user || req.session.user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    if (user.accessToken === 'mock-token') {
      // Mock repos for development
      const mockRepos = [
        {
          id: 1,
          name: 'test-project',
          description: 'Ett test-projekt för AI-Arkitekt',
          html_url: 'https://github.com/testuser/test-project',
          private: false
        },
        {
          id: 2,
          name: 'private-repo',
          description: 'Privat repository',
          html_url: 'https://github.com/testuser/private-repo',
          private: true
        }
      ];
      return res.json({ repos: mockRepos });
    }
    
    const fetch = require('node-fetch');
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${user.accessToken}`,
        'User-Agent': 'AI-Arkitekt'
      }
    });
    
    const repos = await response.json();
    res.json({ repos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API routes
app.use('/api', apiRoutes);

// Legacy endpoints for backward compatibility
const multer = require('multer');
const uploadHandler = require('./upload');
const scanProject = require('./scan');
const CodeAnalyzer = require('./analyzer');
const EnhancedAnalyzer = require('./enhanced-analyzer-simple');
const IntelligentCodeAnalyzer = require('./intelligent-code-analyzer');
const DeepCodeAnalyzer = require('./deep-code-analyzer');
const AdvancedCodeAnalyzer = require('./advanced-code-analyzer');
const CodeReplacementAnalyzer = require('./code-replacement-analyzer');
const GitHubIntegration = require('./github-integration');

const upload = multer({ dest: 'uploads/' });
const analyzer = new CodeAnalyzer();
const enhancedAnalyzer = new EnhancedAnalyzer();
const intelligentAnalyzer = new IntelligentCodeAnalyzer();
const deepAnalyzer = new DeepCodeAnalyzer();
const advancedAnalyzer = new AdvancedCodeAnalyzer();
const replacementAnalyzer = new CodeReplacementAnalyzer();
const github = new GitHubIntegration();

// Store progress for legacy endpoint
const legacyProgress = new Map();

app.get('/api/legacy-progress/:id', (req, res) => {
  const progress = legacyProgress.get(req.params.id) || { progress: 0, stage: 'Startar...' };
  res.json(progress);
});

app.post('/upload', upload.single('zipfile'), async (req, res) => {
  const analysisId = Date.now().toString();
  
  try {
    legacyProgress.set(analysisId, { progress: 10, stage: 'Extraherar filer...' });
    const projectPath = await uploadHandler(req.file.path);
    
    legacyProgress.set(analysisId, { progress: 30, stage: 'Skannar projekt...' });
    const scanResult = await scanProject(projectPath);
    
    // Try replacement analyzer first, then fallback
    let analysis;
    try {
      legacyProgress.set(analysisId, { progress: 50, stage: 'Analyserar kodmönster...' });
      analysis = await replacementAnalyzer.analyzeCodeForReplacements(projectPath, scanResult);
      console.log('✅ Using code replacement analysis');
    } catch (error) {
      console.log('🔄 Advanced analyzer failed, trying deep:', error.message);
      try {
        legacyProgress.set(analysisId, { progress: 60, stage: 'Djupanalys...' });
        analysis = await deepAnalyzer.performDeepAnalysis(projectPath, scanResult);
        console.log('✅ Using deep code analysis');
      } catch (error2) {
        console.log('🔄 Deep analyzer failed, trying intelligent:', error2.message);
        try {
          legacyProgress.set(analysisId, { progress: 70, stage: 'Intelligent analys...' });
          analysis = await intelligentAnalyzer.analyzeCodeIntelligently(projectPath, scanResult);
          console.log('✅ Using intelligent analysis');
        } catch (error3) {
          console.log('🔄 Intelligent analyzer failed, trying enhanced:', error3.message);
          try {
            legacyProgress.set(analysisId, { progress: 80, stage: 'Förbättrad analys...' });
            analysis = await enhancedAnalyzer.analyzeProjectAdvanced(projectPath, scanResult);
            console.log('✅ Using enhanced analysis');
          } catch (error4) {
            console.log('🔄 Enhanced analyzer failed, using basic:', error4.message);
            legacyProgress.set(analysisId, { progress: 90, stage: 'Grundanalys...' });
            analysis = analyzer.analyzeProject(projectPath, scanResult);
            console.log('✅ Using basic analysis');
          }
        }
      }
    }
    
    legacyProgress.set(analysisId, { progress: 100, stage: 'Klar!' });
    
    res.json({
      success: true,
      source: 'upload',
      analysisId,
      ...analysis,
      timestamp: new Date().toISOString()
    });
    
    // Clean up progress after 5 minutes
    setTimeout(() => legacyProgress.delete(analysisId), 5 * 60 * 1000);
  } catch (err) {
    legacyProgress.set(analysisId, { progress: 100, stage: 'Fel uppstod' });
    res.status(500).json({ 
      success: false, 
      error: err.message,
      analysisId
    });
  }
});

app.post('/analyze-github', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Repository URL krävs'
      });
    }

    const { projectPath, repoInfo } = await github.analyzeFromGitHub(repoUrl);
    const scanResult = await scanProject(projectPath);
    
    // Use same analyzer chain as upload - try replacement analyzer first
    let analysis;
    try {
      analysis = await replacementAnalyzer.analyzeCodeForReplacements(projectPath, scanResult);
      console.log('✅ Using code replacement analysis for GitHub');
    } catch (error) {
      console.log('🔄 Replacement analyzer failed, trying deep:', error.message);
      try {
        analysis = await deepAnalyzer.performDeepAnalysis(projectPath, scanResult);
        console.log('✅ Using deep code analysis for GitHub');
      } catch (error2) {
        console.log('🔄 Deep analyzer failed, trying intelligent:', error2.message);
        try {
          analysis = await intelligentAnalyzer.analyzeCodeIntelligently(projectPath, scanResult);
          console.log('✅ Using intelligent analysis for GitHub');
        } catch (error3) {
          console.log('🔄 Intelligent analyzer failed, trying enhanced:', error3.message);
          try {
            analysis = await enhancedAnalyzer.analyzeProjectAdvanced(projectPath, scanResult);
            console.log('✅ Using enhanced analysis for GitHub');
          } catch (error4) {
            console.log('🔄 Enhanced analyzer failed, using basic:', error4.message);
            analysis = analyzer.analyzeProject(projectPath, scanResult);
            console.log('✅ Using basic analysis for GitHub');
          }
        }
      }
    }
    
    res.json({
      success: true,
      source: 'github',
      repoInfo,
      ...analysis,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.get('/api-catalog', (req, res) => {
  const catalog = require('./improvements-catalog.json');
  res.json(catalog.apis);
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI-Arkitekt API Server', 
    status: 'running',
    endpoints: ['/upload', '/analyze-github', '/health'],
    timestamp: new Date().toISOString() 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🏗️ AI-Arkitekt server running on port ${PORT}`);
  console.log('📁 Legacy upload: POST /upload');
  console.log('🚀 New API: /api/*');
  console.log('📊 Projects: POST /api/projects');
  console.log('🔍 Scans: GET /api/scans/:id');
});