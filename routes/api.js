const express = require('express');
const multer = require('multer');
const Database = require('../models/database');
const CodeAnalyzer = require('../analyzer');
const GitHubIntegration = require('../github-integration');
const uploadHandler = require('../upload');
const scanProject = require('../scan');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const db = new Database();
const analyzer = new CodeAnalyzer();
const github = new GitHubIntegration();

// Mock user for MVP (replace with real auth)
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

// Store progress for each analysis
const analysisProgress = new Map();

// GET /api/progress/:id
router.get('/progress/:id', (req, res) => {
  const progress = analysisProgress.get(req.params.id) || { progress: 0, stage: 'Startar...' };
  res.json(progress);
});

// POST /api/projects
router.post('/projects', async (req, res) => {
  try {
    const { name, repoUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await db.createProject(mockUserId, name, repoUrl);
    await db.logAction(mockUserId, 'create_project', 'project', project.id);
    
    res.status(201).json({
      projectId: project.id,
      name: project.name,
      repoUrl: project.repo_url,
      createdAt: project.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects/:projectId/upload
router.post('/projects/:projectId/upload', upload.single('zipfile'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { repoUrl, branch = 'main', token } = req.body;
    const analysisId = Date.now().toString();
    
    let scan;
    let projectPath;
    
    analysisProgress.set(analysisId, { progress: 10, stage: 'Förbereder analys...' });
    
    if (req.file) {
      // ZIP upload
      scan = await db.createScan(projectId, req.file.filename);
      analysisProgress.set(analysisId, { progress: 30, stage: 'Extraherar filer...' });
      projectPath = await uploadHandler(req.file.path);
    } else if (repoUrl) {
      // GitHub repo
      scan = await db.createScan(projectId, null, branch);
      analysisProgress.set(analysisId, { progress: 30, stage: 'Laddar från GitHub...' });
      const result = await github.analyzeFromGitHub(repoUrl);
      projectPath = result.projectPath;
    } else {
      return res.status(400).json({ error: 'Either zipfile or repoUrl is required' });
    }

    // Start async scan process
    processScan(scan.id, projectPath, analysisId);
    
    res.status(202).json({
      scanId: scan.id,
      status: 'queued',
      projectId,
      analysisId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scans/:scanId
router.get('/scans/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    const scan = await db.getScan(scanId);
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const response = {
      scanId: scan.id,
      projectId: scan.project_id,
      status: scan.status,
      startedAt: scan.started_at,
      finishedAt: scan.finished_at
    };

    if (scan.summary_json) {
      response.summary = scan.summary_json;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scans/:scanId/findings
router.get('/scans/:scanId/findings', async (req, res) => {
  try {
    const { scanId } = req.params;
    const { category, impact, effort } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (impact) filters.impact = impact;
    if (effort) filters.effort = effort;
    
    const findings = await db.getFindings(scanId, filters);
    
    res.json({
      scanId,
      findings: findings.map(f => ({
        id: f.id,
        title: f.title,
        category: f.category,
        impact: f.impact,
        effort: f.effort,
        confidence: f.confidence,
        description: f.description,
        codePointers: f.code_pointers,
        snippetId: f.snippet_id,
        hasSnippet: !!f.snippet_code
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/snippets/generate
router.post('/snippets/generate', async (req, res) => {
  try {
    const { findingId, language = 'javascript' } = req.body;
    
    if (!findingId) {
      return res.status(400).json({ error: 'findingId is required' });
    }

    // Get finding details
    const finding = await db.pool.query('SELECT * FROM findings WHERE id = $1', [findingId]);
    if (finding.rows.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    const findingData = finding.rows[0];
    
    // Generate snippet based on category
    const snippet = generateSnippetForCategory(findingData.category, language);
    
    const snippetId = await db.createSnippet(findingId, language, snippet.code, snippet.requiredEnv);
    
    res.json({
      snippetId,
      code: snippet.code,
      requiredEnv: snippet.requiredEnv,
      instructions: snippet.instructions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/catalog
router.get('/catalog', async (req, res) => {
  try {
    const { category } = req.query;
    const filters = {};
    if (category) filters.category = category;
    
    const items = await db.getCatalogItems(filters);
    
    res.json({
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        categories: item.categories,
        tags: item.tags,
        quickPitch: item.quick_pitch,
        integrationGuide: item.integration_guide,
        pricingMeta: item.pricing_meta
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Async scan processing
async function processScan(scanId, projectPath, analysisId) {
  try {
    await db.updateScanStatus(scanId, 'running');
    analysisProgress.set(analysisId, { progress: 50, stage: 'Analyserar kod...' });
    
    // Run analysis
    const scanResult = await scanProject(projectPath);
    analysisProgress.set(analysisId, { progress: 70, stage: 'Genererar förslag...' });
    const analysis = analyzer.analyzeProject(projectPath, scanResult);
    
    analysisProgress.set(analysisId, { progress: 85, stage: 'Sparar resultat...' });
    
    // Store findings
    const findingIds = [];
    for (const suggestion of analysis.suggestions) {
      const findingId = await db.createFinding(scanId, {
        title: suggestion.title,
        category: suggestion.category.toLowerCase(),
        impact: mapImpactScore(suggestion.impact),
        effort: mapEffortScore(suggestion.effort),
        confidence: 0.8,
        description: suggestion.description,
        codePointers: []
      });
      findingIds.push(findingId);
    }
    
    // Update scan summary
    const summary = {
      findingsCount: findingIds.length,
      topSuggestion: analysis.suggestions[0]?.title || 'No suggestions',
      estimatedImpact: analysis.suggestions[0]?.impact >= 7 ? 'high' : 'medium',
      language: analysis.analysis.language,
      framework: analysis.analysis.framework
    };
    
    analysisProgress.set(analysisId, { progress: 100, stage: 'Klar!' });
    await db.updateScanStatus(scanId, 'done', summary);
    
    // Clean up progress after 5 minutes
    setTimeout(() => analysisProgress.delete(analysisId), 5 * 60 * 1000);
  } catch (error) {
    console.error('Scan processing error:', error);
    analysisProgress.set(analysisId, { progress: 100, stage: 'Fel uppstod' });
    await db.updateScanStatus(scanId, 'failed', { error: error.message });
  }
}

function mapImpactScore(score) {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

function mapEffortScore(score) {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}

function generateSnippetForCategory(category, language) {
  const snippets = {
    ux: {
      code: `// AI Chatbot Integration
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Du är en hjälpsam kundtjänstassistent." },
        { role: "user", content: message }
      ],
      max_tokens: 150
    });
    
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Chatbot error' });
  }
});

module.exports = router;`,
      requiredEnv: ['OPENAI_API_KEY'],
      instructions: '1. Installera openai: npm install openai\n2. Lägg till OPENAI_API_KEY i .env\n3. Inkludera router i din app'
    },
    business: {
      code: `// Simple Recommendation Engine
class RecommendationEngine {
  constructor() {
    this.userInteractions = new Map();
  }

  trackInteraction(userId, productId, action = 'view') {
    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, new Map());
    }
    
    const userMap = this.userInteractions.get(userId);
    const current = userMap.get(productId) || 0;
    userMap.set(productId, current + (action === 'purchase' ? 5 : 1));
  }

  getRecommendations(userId, limit = 5) {
    // Implementation here
    return [];
  }
}

module.exports = RecommendationEngine;`,
      requiredEnv: [],
      instructions: '1. Integrera i din befintliga kod\n2. Anropa trackInteraction() vid användaraktiviteter\n3. Använd getRecommendations() för att visa förslag'
    }
  };

  return snippets[category] || snippets.ux;
}

module.exports = router;