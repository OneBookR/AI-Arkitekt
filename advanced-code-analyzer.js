const fs = require('fs');
const path = require('path');

class AdvancedCodeAnalyzer {
  constructor() {
    this.apiDatabase = require('./data/comprehensive-api-database.json');
  }

  async performAdvancedAnalysis(projectPath, scanResult) {
    console.log('🔬 Starting advanced code analysis...');
    
    const codebase = await this.buildCodebaseMap(projectPath);
    const architecture = this.analyzeArchitecture(codebase);
    const functionality = this.analyzeFunctionality(codebase);
    const problems = this.identifyProblems(codebase, architecture);
    const opportunities = this.findOpportunities(codebase, functionality);
    
    return {
      analysis: {
        ...scanResult,
        applicationPurpose: this.determineApplicationPurpose(functionality, architecture),
        architecture,
        functionality,
        problems,
        codebase: {
          totalFiles: codebase.files.length,
          totalLines: codebase.totalLines,
          languages: Array.from(codebase.languages),
          frameworks: Array.from(codebase.frameworks)
        }
      },
      suggestions: this.generateRecommendations(problems, opportunities, functionality),
      insights: this.generateInsights(codebase, functionality, problems)
    };
  }

  async buildCodebaseMap(projectPath) {
    const codebase = {
      files: [],
      totalLines: 0,
      languages: new Set(),
      frameworks: new Set(),
      dependencies: {},
      components: new Map(),
      functions: new Map(),
      routes: new Map(),
      models: new Map(),
      imports: new Map()
    };

    const files = this.getAllFiles(projectPath);
    
    for (const file of files) {
      if (this.isCodeFile(file.ext)) {
        const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
        const analysis = this.analyzeFile(content, file);
        
        codebase.files.push({ ...file, content, analysis });
        codebase.totalLines += content.split('\n').length;
        
        // Extract code elements
        this.extractComponents(content, file.path, codebase.components);
        this.extractFunctions(content, file.path, codebase.functions);
        this.extractRoutes(content, file.path, codebase.routes);
        this.extractModels(content, file.path, codebase.models);
        this.extractImports(content, file.path, codebase.imports);
        
        // Identify languages and frameworks
        this.identifyTech(content, file.ext, codebase);
      }
    }

    this.analyzeDependencies(projectPath, codebase);
    return codebase;
  }

  analyzeFile(content, file) {
    return {
      complexity: this.calculateComplexity(content),
      patterns: this.detectPatterns(content),
      security: this.scanSecurity(content),
      performance: this.checkPerformance(content),
      maintainability: this.assessMaintainability(content)
    };
  }

  analyzeFunctionality(codebase) {
    const functionality = {
      type: 'unknown',
      features: new Set(),
      userTypes: new Set(),
      dataFlow: [],
      businessLogic: [],
      integrations: new Set()
    };

    // Analyze components and functions to understand what app does
    for (const [name, info] of codebase.components) {
      const purpose = this.inferComponentPurpose(name, info.content);
      if (purpose) functionality.features.add(purpose);
    }

    for (const [name, info] of codebase.functions) {
      const purpose = this.inferFunctionPurpose(name, info.content);
      if (purpose) functionality.features.add(purpose);
    }

    // Analyze routes to understand API structure
    for (const [route, info] of codebase.routes) {
      const purpose = this.inferRoutePurpose(route, info.content);
      if (purpose) functionality.features.add(purpose);
    }

    // Determine application type from features
    functionality.type = this.classifyApplication(functionality.features);
    functionality.userTypes = this.identifyUserTypes(functionality.features);
    
    return functionality;
  }

  inferComponentPurpose(name, content) {
    const lowerName = name.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // E-commerce components
    if (lowerName.includes('product') || lowerContent.includes('price')) return 'produkthantering';
    if (lowerName.includes('cart') || lowerName.includes('basket')) return 'kundkorg';
    if (lowerName.includes('checkout') || lowerContent.includes('payment')) return 'betalning';
    if (lowerName.includes('order')) return 'orderhantering';
    
    // Calendar components
    if (lowerName.includes('calendar') || lowerName.includes('event')) return 'kalender';
    if (lowerName.includes('schedule') || lowerName.includes('appointment')) return 'schemaläggning';
    if (lowerName.includes('booking')) return 'bokning';
    
    // User management
    if (lowerName.includes('user') || lowerName.includes('profile')) return 'användarhantering';
    if (lowerName.includes('auth') || lowerName.includes('login')) return 'autentisering';
    if (lowerName.includes('admin') || lowerName.includes('dashboard')) return 'administration';
    
    // Content management
    if (lowerName.includes('blog') || lowerName.includes('post')) return 'blogg';
    if (lowerName.includes('media') || lowerName.includes('gallery')) return 'mediahantering';
    if (lowerName.includes('comment') || lowerName.includes('review')) return 'kommentarer';
    
    return null;
  }

  inferFunctionPurpose(name, content) {
    const lowerName = name.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // CRUD operations
    if (lowerName.startsWith('create') || lowerName.startsWith('add')) return 'datahantering';
    if (lowerName.startsWith('update') || lowerName.startsWith('edit')) return 'datahantering';
    if (lowerName.startsWith('delete') || lowerName.startsWith('remove')) return 'datahantering';
    if (lowerName.startsWith('get') || lowerName.startsWith('fetch')) return 'datahantering';
    
    // Authentication
    if (lowerName.includes('login') || lowerName.includes('auth')) return 'autentisering';
    if (lowerName.includes('validate') || lowerName.includes('verify')) return 'validering';
    
    // Business logic
    if (lowerName.includes('calculate') || lowerName.includes('compute')) return 'beräkningar';
    if (lowerName.includes('process') || lowerName.includes('handle')) return 'affärslogik';
    if (lowerName.includes('send') || lowerName.includes('notify')) return 'kommunikation';
    
    return null;
  }

  classifyApplication(features) {
    const featureArray = Array.from(features);
    
    // E-commerce indicators
    const ecommerceFeatures = ['produkthantering', 'kundkorg', 'betalning', 'orderhantering'];
    if (ecommerceFeatures.some(f => featureArray.includes(f))) return 'e-commerce';
    
    // Calendar indicators
    const calendarFeatures = ['kalender', 'schemaläggning', 'bokning'];
    if (calendarFeatures.some(f => featureArray.includes(f))) return 'kalender';
    
    // Content management
    const contentFeatures = ['blogg', 'mediahantering', 'kommentarer'];
    if (contentFeatures.some(f => featureArray.includes(f))) return 'innehållshantering';
    
    // Business application
    const businessFeatures = ['användarhantering', 'administration', 'datahantering'];
    if (businessFeatures.some(f => featureArray.includes(f))) return 'affärsapplikation';
    
    return 'webbapplikation';
  }

  identifyProblems(codebase, architecture) {
    const problems = [];
    
    // Security problems
    const securityIssues = this.findSecurityIssues(codebase);
    if (securityIssues.length > 0) {
      problems.push({
        type: 'security',
        severity: 'high',
        title: `${securityIssues.length} säkerhetsproblem upptäckta`,
        description: 'Kritiska säkerhetsbrister som måste åtgärdas',
        issues: securityIssues,
        impact: 'Hög risk för dataläckor och attacker'
      });
    }
    
    // Performance problems
    const performanceIssues = this.findPerformanceIssues(codebase);
    if (performanceIssues.length > 0) {
      problems.push({
        type: 'performance',
        severity: 'medium',
        title: `${performanceIssues.length} prestandaproblem`,
        description: 'Kod som kan orsaka långsamma svarstider',
        issues: performanceIssues,
        impact: 'Dålig användarupplevelse och hög serverbelastning'
      });
    }
    
    // Code quality problems
    const qualityIssues = this.findQualityIssues(codebase);
    if (qualityIssues.length > 0) {
      problems.push({
        type: 'quality',
        severity: 'medium',
        title: `${qualityIssues.length} kodkvalitetsproblem`,
        description: 'Kod som är svår att underhålla och utveckla',
        issues: qualityIssues,
        impact: 'Långsammare utveckling och fler buggar'
      });
    }
    
    return problems;
  }

  findSecurityIssues(codebase) {
    const issues = [];
    
    for (const file of codebase.files) {
      const content = file.content;
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // SQL injection risks
        if (line.includes('query') && line.includes('+') && line.includes('req.')) {
          issues.push({
            file: file.path,
            line: index + 1,
            type: 'sql_injection',
            code: line.trim(),
            description: 'Potentiell SQL injection sårbarhet'
          });
        }
        
        // Unvalidated input
        if (line.includes('req.body') && !content.includes('validate')) {
          issues.push({
            file: file.path,
            line: index + 1,
            type: 'unvalidated_input',
            code: line.trim(),
            description: 'Ovaliderad användarinput'
          });
        }
        
        // Hardcoded secrets
        if (line.match(/password|secret|key.*=.*['"][^'"]{8,}['"]/i)) {
          issues.push({
            file: file.path,
            line: index + 1,
            type: 'hardcoded_secret',
            code: line.trim().replace(/['"][^'"]+['"]/, '"***"'),
            description: 'Hårdkodad hemlighet i kod'
          });
        }
      });
    }
    
    return issues;
  }

  generateRecommendations(problems, opportunities, functionality) {
    const recommendations = [];
    
    problems.forEach(problem => {
      const solutions = this.findSolutionsForProblem(problem, functionality);
      if (solutions.length > 0) {
        recommendations.push({
          category: problem.type,
          title: `Åtgärda ${problem.title.toLowerCase()}`,
          description: problem.description,
          impact: problem.severity === 'high' ? 9 : 6,
          effort: solutions.length > 2 ? 7 : 4,
          solutions: solutions.slice(0, 3)
        });
      }
    });
    
    return recommendations.sort((a, b) => b.impact - a.impact);
  }

  findSolutionsForProblem(problem, functionality) {
    const solutions = [];
    
    if (problem.type === 'security') {
      if (this.apiDatabase.authentication) {
        solutions.push(...this.apiDatabase.authentication.slice(0, 2));
      }
      if (this.apiDatabase.monitoring) {
        solutions.push(this.apiDatabase.monitoring[0]);
      }
    }
    
    if (problem.type === 'performance') {
      if (this.apiDatabase.caching) {
        solutions.push(...this.apiDatabase.caching.slice(0, 2));
      }
    }
    
    return solutions;
  }

  // Helper methods
  getAllFiles(dir) {
    const files = [];
    const scan = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isFile()) {
            files.push({
              path: fullPath.replace(dir, ''),
              ext: path.extname(item)
            });
          } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(fullPath);
          }
        });
      } catch (error) {}
    };
    scan(dir);
    return files;
  }

  isCodeFile(ext) {
    return ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.php', '.rb', '.go', '.cs'].includes(ext);
  }

  extractComponents(content, filePath, components) {
    const matches = content.match(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g);
    if (matches) {
      matches.forEach(match => {
        const name = match.split(/\s+/).pop();
        components.set(name, { file: filePath, content });
      });
    }
  }

  extractFunctions(content, filePath, functions) {
    const matches = content.match(/(?:function|const)\s+([a-zA-Z][a-zA-Z0-9]*)/g);
    if (matches) {
      matches.forEach(match => {
        const name = match.split(/\s+/).pop();
        functions.set(name, { file: filePath, content });
      });
    }
  }

  extractRoutes(content, filePath, routes) {
    const matches = content.match(/app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (matches) {
      matches.forEach(match => {
        const route = match.match(/['"`]([^'"`]+)['"`]/)[1];
        routes.set(route, { file: filePath, content });
      });
    }
  }

  // Stub methods
  extractModels() {}
  extractImports() {}
  identifyTech() {}
  analyzeDependencies() {}
  analyzeArchitecture() { return {}; }
  calculateComplexity() { return 1; }
  detectPatterns() { return []; }
  scanSecurity() { return []; }
  checkPerformance() { return []; }
  assessMaintainability() { return 1; }
  identifyUserTypes() { return new Set(['users']); }
  findOpportunities() { return []; }
  findPerformanceIssues() { return []; }
  findQualityIssues() { return []; }
  determineApplicationPurpose(functionality) {
    return {
      type: functionality.type,
      description: `${functionality.type} med ${functionality.features.size} huvudfunktioner`,
      mainFeatures: Array.from(functionality.features),
      userTypes: Array.from(functionality.userTypes)
    };
  }
  generateInsights() { return {}; }
}

module.exports = AdvancedCodeAnalyzer;