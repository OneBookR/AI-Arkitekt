const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
  constructor() {
    this.improvements = require('./improvements-catalog.json');
  }

  analyzeProject(projectPath, scanResult) {
    const analysis = {
      ...scanResult,
      files: this.getFileStructure(projectPath),
      dependencies: this.analyzeDependencies(projectPath),
      patterns: this.detectPatterns(projectPath),
      gdprRisks: this.checkGDPRRisks(projectPath)
    };

    const suggestions = this.generateSuggestions(analysis);
    const rankedSuggestions = this.rankSuggestions(suggestions, analysis);
    const codeSnippets = this.generateCodeSnippets(rankedSuggestions.slice(0, 3));

    return {
      analysis,
      suggestions: rankedSuggestions,
      codeSnippets,
      gdprFlags: analysis.gdprRisks
    };
  }

  getFileStructure(dir) {
    const files = [];
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          files.push({
            path: fullPath.replace(dir, ''),
            ext: path.extname(item),
            size: stat.size
          });
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        }
      });
    };
    scan(dir);
    return files;
  }

  analyzeDependencies(projectPath) {
    const deps = { packages: [], outdated: [], security: [] };
    
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      deps.packages = Object.keys(pkg.dependencies || {});
      
      // Simulera säkerhetskontroll
      const riskyPackages = ['lodash', 'moment', 'request'];
      deps.security = deps.packages.filter(p => riskyPackages.includes(p));
    }
    
    return deps;
  }

  detectPatterns(projectPath) {
    const patterns = {
      hasAuth: false,
      hasAPI: false,
      hasDatabase: false,
      hasPayment: false,
      hasFileUpload: false,
      hasEmail: false,
      hasChat: false,
      hasSearch: false
    };

    const files = this.getFileStructure(projectPath);
    files.forEach(file => {
      if (file.ext === '.js' || file.ext === '.ts') {
        const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
        
        if (content.includes('passport') || content.includes('jwt') || content.includes('auth')) {
          patterns.hasAuth = true;
        }
        if (content.includes('express') || content.includes('app.get') || content.includes('app.post')) {
          patterns.hasAPI = true;
        }
        if (content.includes('mongoose') || content.includes('sequelize') || content.includes('prisma')) {
          patterns.hasDatabase = true;
        }
        if (content.includes('stripe') || content.includes('paypal') || content.includes('payment')) {
          patterns.hasPayment = true;
        }
        if (content.includes('multer') || content.includes('upload')) {
          patterns.hasFileUpload = true;
        }
        if (content.includes('nodemailer') || content.includes('sendgrid')) {
          patterns.hasEmail = true;
        }
        if (content.includes('socket.io') || content.includes('websocket')) {
          patterns.hasChat = true;
        }
        if (content.includes('elasticsearch') || content.includes('search')) {
          patterns.hasSearch = true;
        }
      }
    });

    return patterns;
  }

  checkGDPRRisks(projectPath) {
    const risks = [];
    const files = this.getFileStructure(projectPath);
    
    files.forEach(file => {
      if (file.ext === '.js' || file.ext === '.ts') {
        const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
        
        // Kontrollera personuppgifter
        const personalDataPatterns = [
          /email/gi, /phone/gi, /address/gi, /name/gi, 
          /birthday/gi, /ssn/gi, /passport/gi, /ip.*address/gi
        ];
        
        personalDataPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            risks.push({
              file: file.path,
              type: 'personal_data',
              pattern: pattern.source,
              severity: 'medium'
            });
          }
        });

        // Kontrollera cookies och tracking
        if (content.includes('cookie') || content.includes('localStorage') || content.includes('sessionStorage')) {
          risks.push({
            file: file.path,
            type: 'data_storage',
            description: 'Använder cookies/lokal lagring',
            severity: 'low'
          });
        }

        // Kontrollera tredjepartstjänster
        const thirdPartyServices = ['google-analytics', 'facebook', 'mixpanel', 'hotjar'];
        thirdPartyServices.forEach(service => {
          if (content.includes(service)) {
            risks.push({
              file: file.path,
              type: 'third_party',
              service,
              severity: 'high'
            });
          }
        });
      }
    });

    return risks;
  }

  generateSuggestions(analysis) {
    const suggestions = [];
    
    // UX förbättringar
    if (!analysis.patterns.hasChat) {
      suggestions.push({
        category: 'UX',
        title: 'Lägg till AI-chatbot för kundsupport',
        description: 'Implementera en intelligent chatbot för att förbättra kundupplevelsen',
        impact: 8,
        effort: 3,
        apis: ['OpenAI GPT-4', 'Anthropic Claude', 'Dialogflow'],
        estimatedHours: 8
      });
    }

    if (!analysis.patterns.hasSearch) {
      suggestions.push({
        category: 'UX',
        title: 'Förbättra sökfunktionalitet',
        description: 'Implementera intelligent sökning med AI-driven relevans',
        impact: 7,
        effort: 4,
        apis: ['Elasticsearch', 'Algolia', 'Azure Cognitive Search'],
        estimatedHours: 16
      });
    }

    // Affärsförbättringar
    suggestions.push({
      category: 'Business',
      title: 'Personaliserade produktrekommendationer',
      description: 'AI-drivna rekommendationer baserat på användarens beteende',
      impact: 9,
      effort: 6,
      apis: ['AWS Personalize', 'Google Recommendations AI', 'Azure Personalizer'],
      estimatedHours: 32
    });

    // Drift förbättringar
    suggestions.push({
      category: 'DevOps',
      title: 'Implementera avancerad monitorering',
      description: 'Real-time övervakning och alerting för bättre driftstabilitet',
      impact: 8,
      effort: 4,
      apis: ['DataDog', 'New Relic', 'Grafana Cloud'],
      estimatedHours: 12
    });

    // Content förbättringar
    suggestions.push({
      category: 'Content',
      title: 'Automatisk innehållsgenerering',
      description: 'AI-genererat innehåll för bloggar och produktbeskrivningar',
      impact: 6,
      effort: 3,
      apis: ['OpenAI GPT-4', 'Jasper AI', 'Copy.ai'],
      estimatedHours: 10
    });

    // Säkerhetsförbättringar
    if (analysis.dependencies.security.length > 0) {
      suggestions.push({
        category: 'Security',
        title: 'Uppdatera säkerhetsrisker i dependencies',
        description: `Upptäckte ${analysis.dependencies.security.length} potentiella säkerhetsrisker`,
        impact: 9,
        effort: 2,
        apis: ['Snyk', 'WhiteSource', 'GitHub Security'],
        estimatedHours: 4
      });
    }

    return suggestions;
  }

  rankSuggestions(suggestions, analysis) {
    return suggestions
      .map(s => ({
        ...s,
        score: (s.impact * 2 - s.effort) / s.estimatedHours * 10
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  generateCodeSnippets(topSuggestions) {
    const snippets = [];
    
    topSuggestions.forEach(suggestion => {
      if (suggestion.category === 'UX' && suggestion.title.includes('chatbot')) {
        snippets.push({
          title: 'Express Chatbot Route',
          description: 'Enkel OpenAI-integration för chatbot',
          code: `// routes/chat.js
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
    
    res.json({ 
      reply: completion.choices[0].message.content 
    });
  } catch (error) {
    res.status(500).json({ error: 'Chatbot fel' });
  }
});

module.exports = router;`,
          envVars: ['OPENAI_API_KEY'],
          dependencies: ['openai']
        });
      }

      if (suggestion.category === 'Business' && suggestion.title.includes('rekommendationer')) {
        snippets.push({
          title: 'Enkel Rekommendationsmotor',
          description: 'Grundläggande collaborative filtering',
          code: `// services/recommendations.js
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
    const userPrefs = this.userInteractions.get(userId);
    if (!userPrefs) return [];

    // Enkel similarity-baserad rekommendation
    const recommendations = [];
    for (const [otherUserId, otherPrefs] of this.userInteractions) {
      if (otherUserId === userId) continue;
      
      const similarity = this.calculateSimilarity(userPrefs, otherPrefs);
      if (similarity > 0.3) {
        for (const [productId, score] of otherPrefs) {
          if (!userPrefs.has(productId)) {
            recommendations.push({ productId, score: score * similarity });
          }
        }
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateSimilarity(prefs1, prefs2) {
    const common = [];
    for (const [productId] of prefs1) {
      if (prefs2.has(productId)) {
        common.push(productId);
      }
    }
    
    if (common.length === 0) return 0;
    return common.length / Math.sqrt(prefs1.size * prefs2.size);
  }
}

module.exports = RecommendationEngine;`,
          envVars: [],
          dependencies: []
        });
      }
    });

    return snippets;
  }
}

module.exports = CodeAnalyzer;