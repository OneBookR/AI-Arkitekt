const OpenAI = require('openai');

class AICodeAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
    });
    this.apiDatabase = require('./data/comprehensive-api-database.json');
  }

  async analyzeCodeWithAI(codebase) {
    console.log('🤖 Analyzing code with AI...');
    
    // Prepare code summary for AI
    const codeSummary = this.prepareCodeSummary(codebase);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Du är en expert kodanalytiker. Analysera koden och ge:
1. Vad applikationen gör (syfte och huvudfunktioner)
2. Identifierade problem och brister
3. Konkreta förbättringsområden
4. Säkerhetsrisker
5. Prestandaproblem

Svara på svenska i JSON-format med följande struktur:
{
  "purpose": {
    "type": "string",
    "description": "string",
    "mainFeatures": ["string"]
  },
  "problems": [
    {
      "category": "string",
      "severity": "high|medium|low",
      "description": "string",
      "impact": "string",
      "solution": "string"
    }
  ],
  "improvements": [
    {
      "area": "string",
      "description": "string",
      "priority": "high|medium|low",
      "effort": "low|medium|high"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Analysera denna kodbas:\n\n${codeSummary}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const aiAnalysis = JSON.parse(completion.choices[0].message.content);
      return this.enhanceWithAPIRecommendations(aiAnalysis);
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.fallbackAnalysis(codebase);
    }
  }

  prepareCodeSummary(codebase) {
    let summary = `Projekt med ${codebase.files.length} filer (${codebase.totalLines} rader kod)\n\n`;
    
    // Smart file prioritization - get most important files regardless of name
    const prioritizedFiles = this.prioritizeFiles(codebase.files);
      
    prioritizedFiles.slice(0, 8).forEach(file => {
      summary += `=== ${file.path} (${file.lines} rader) ===\n`;
      summary += file.content.substring(0, 1200) + '\n\n';
    });
    
    // Add dependencies and frameworks
    if (Object.keys(codebase.dependencies).length > 0) {
      summary += `Dependencies: ${Object.keys(codebase.dependencies).join(', ')}\n`;
    }
    
    return summary;
  }

  prioritizeFiles(files) {
    return files
      .map(file => ({
        ...file,
        priority: this.calculateFilePriority(file)
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  calculateFilePriority(file) {
    let priority = 0;
    const fileName = file.path.toLowerCase();
    const content = file.content.toLowerCase();
    
    // High priority patterns
    if (fileName.includes('package.json')) priority += 100;
    if (fileName.includes('app.') || fileName.includes('main.') || fileName.includes('index.')) priority += 80;
    if (fileName.includes('server.') || fileName.includes('api.')) priority += 70;
    if (fileName.includes('config') || fileName.includes('setup')) priority += 60;
    
    // Content-based priority
    if (content.includes('express') || content.includes('app.listen')) priority += 50;
    if (content.includes('react') || content.includes('component')) priority += 40;
    if (content.includes('router') || content.includes('endpoint')) priority += 35;
    if (content.includes('database') || content.includes('mongoose') || content.includes('sequelize')) priority += 30;
    
    // Size matters - larger files likely more important
    priority += Math.min(file.lines / 10, 20);
    
    // Penalize test files and configs
    if (fileName.includes('test') || fileName.includes('spec')) priority -= 30;
    if (fileName.includes('.config.') || fileName.includes('webpack')) priority -= 20;
    
    return priority;
  }

  enhanceWithAPIRecommendations(aiAnalysis) {
    // Map AI-identified problems to our API database
    const recommendations = [];
    
    aiAnalysis.problems.forEach(problem => {
      const apiSuggestions = this.findRelevantAPIs(problem);
      if (apiSuggestions.length > 0) {
        recommendations.push({
          problem: problem.description,
          severity: problem.severity,
          solutions: apiSuggestions.map(api => ({
            provider: api.name,
            description: api.description,
            implementation: api.implementation_notes,
            cost: api.pricing_model,
            effort: this.estimateEffort(api)
          }))
        });
      }
    });

    return {
      ...aiAnalysis,
      apiRecommendations: recommendations
    };
  }

  findRelevantAPIs(problem) {
    const problemText = problem.description.toLowerCase();
    const relevantAPIs = [];
    
    // Search through our API database
    Object.values(this.apiDatabase).flat().forEach(api => {
      const apiText = `${api.name} ${api.description} ${api.use_cases.join(' ')}`.toLowerCase();
      
      // Simple relevance scoring
      const keywords = problemText.split(' ').filter(word => word.length > 3);
      const relevanceScore = keywords.reduce((score, keyword) => {
        return score + (apiText.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (relevanceScore > 0) {
        relevantAPIs.push({ ...api, relevanceScore });
      }
    });
    
    return relevantAPIs
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  }

  estimateEffort(api) {
    const complexityIndicators = [
      'authentication', 'oauth', 'webhook', 'integration', 'setup'
    ];
    
    const description = api.description.toLowerCase();
    const complexityScore = complexityIndicators.reduce((score, indicator) => {
      return score + (description.includes(indicator) ? 1 : 0);
    }, 0);
    
    if (complexityScore >= 3) return 'high';
    if (complexityScore >= 1) return 'medium';
    return 'low';
  }

  fallbackAnalysis(codebase) {
    return {
      purpose: {
        type: 'application',
        description: 'Applikation som kräver manuell analys',
        mainFeatures: ['Grundläggande funktionalitet']
      },
      problems: [
        {
          category: 'analysis',
          severity: 'medium',
          description: 'AI-analys misslyckades - manuell granskning krävs',
          impact: 'Begränsad automatisk analys',
          solution: 'Kontrollera API-konfiguration'
        }
      ],
      improvements: [],
      apiRecommendations: []
    };
  }
}

module.exports = AICodeAnalyzer;