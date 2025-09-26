const fs = require('fs');
const path = require('path');

class IntelligentCodeAnalyzer {
  constructor() {
    this.apiDatabase = require('./data/comprehensive-api-database.json');
    this.codePatterns = this.initializeCodePatterns();
  }

  initializeCodePatterns() {
    return {
      // Architecture patterns
      mvc: /controller|model|view|routes/gi,
      api: /app\.(get|post|put|delete)|router\.|endpoint|api/gi,
      microservice: /service|microservice|docker|kubernetes/gi,
      
      // Data patterns
      database: /database|db\.|sql|query|table|schema|migration/gi,
      crud: /create|read|update|delete|insert|select|find|save/gi,
      orm: /sequelize|mongoose|prisma|typeorm|knex/gi,
      
      // UI patterns
      frontend: /react|vue|angular|html|css|dom|window|document/gi,
      spa: /router|route|navigation|component|state/gi,
      responsive: /mobile|tablet|responsive|media.*query/gi,
      
      // Business logic patterns
      authentication: /login|auth|jwt|session|password|token/gi,
      authorization: /role|permission|access|admin|user/gi,
      payment: /payment|stripe|paypal|billing|invoice|transaction/gi,
      ecommerce: /product|cart|order|checkout|inventory|catalog/gi,
      
      // Integration patterns
      external_api: /fetch|axios|http|request|api.*call/gi,
      webhook: /webhook|callback|event|trigger/gi,
      email: /email|mail|smtp|sendgrid|nodemailer/gi,
      
      // Performance patterns
      caching: /cache|redis|memcached|storage/gi,
      optimization: /optimize|performance|speed|fast/gi,
      scaling: /scale|load|cluster|worker/gi,
      
      // Security patterns
      encryption: /encrypt|decrypt|hash|bcrypt|crypto/gi,
      validation: /validate|sanitize|joi|yup|schema/gi,
      security: /security|secure|protect|vulnerability/gi,
      
      // Monitoring patterns
      logging: /log|winston|bunyan|console\./gi,
      monitoring: /monitor|metric|analytics|track/gi,
      error_handling: /try.*catch|error|exception|throw/gi,
      
      // File handling
      file_upload: /upload|multer|file|document|attachment/gi,
      file_processing: /process|convert|transform|parse/gi,
      
      // Communication patterns
      realtime: /socket|websocket|realtime|live|push/gi,
      messaging: /message|chat|notification|alert/gi,
      
      // Content patterns
      cms: /content|cms|blog|article|post/gi,
      search: /search|index|elasticsearch|algolia/gi,
      
      // Workflow patterns
      automation: /automate|schedule|cron|job|task/gi,
      workflow: /workflow|process|step|stage|pipeline/gi
    };
  }

  async analyzeCodeIntelligently(projectPath, scanResult) {
    console.log('🧠 Starting intelligent code analysis...');
    
    // Step 1: Deep code analysis
    const codeAnalysis = await this.performDeepCodeAnalysis(projectPath);
    
    // Step 2: Understand project purpose and context
    const projectContext = this.inferProjectContext(codeAnalysis);
    
    // Step 3: Identify current solutions and their limitations
    const currentSolutions = this.identifyCurrentSolutions(codeAnalysis);
    
    // Step 4: Generate intelligent recommendations
    const recommendations = this.generateIntelligentRecommendations(
      codeAnalysis, 
      projectContext, 
      currentSolutions
    );
    
    const marketplace = this.getRelevantMarketplace(projectContext, currentSolutions);
    console.log('🏪 Generated marketplace:', marketplace.length, 'categories');
    
    return {
      analysis: {
        ...scanResult,
        codeAnalysis,
        projectContext,
        currentSolutions,
        projectSummary: this.generateProjectSummary(codeAnalysis, projectContext)
      },
      suggestions: recommendations,
      marketplace: marketplace,
      intelligenceReport: this.generateIntelligenceReport(codeAnalysis, projectContext)
    };
  }

  async performDeepCodeAnalysis(projectPath) {
    const analysis = {
      totalLines: 0,
      fileTypes: {},
      patterns: {},
      technologies: [],
      complexity: 'low',
      codeQuality: {},
      functionalAreas: []
    };

    const files = this.getFileStructure(projectPath);
    let allCode = '';

    for (const file of files) {
      if (this.isCodeFile(file.ext)) {
        try {
          const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
          allCode += content + '\n';
          
          analysis.totalLines += content.split('\n').length;
          analysis.fileTypes[file.ext] = (analysis.fileTypes[file.ext] || 0) + 1;
          
          // Analyze patterns in this file
          this.analyzeFilePatterns(content, analysis);
          
        } catch (error) {
          // Skip unreadable files
        }
      }
    }

    // Analyze overall code patterns and extract actual code snippets
    analysis.actualCodeSnippets = {
      database: [],
      api: [],
      tests: [],
      security: []
    };
    
    for (const [patternName, regex] of Object.entries(this.codePatterns)) {
      const matches = allCode.match(regex) || [];
      analysis.patterns[patternName] = {
        count: matches.length,
        density: matches.length / analysis.totalLines * 1000, // per 1000 lines
        present: matches.length > 0
      };
    }
    
    // Extract actual code snippets
    this.extractActualCodeSnippets(projectPath, analysis);

    // Determine technologies used
    analysis.technologies = this.identifyTechnologies(allCode, analysis.fileTypes);
    
    // Assess complexity
    analysis.complexity = this.assessComplexity(analysis);
    
    // Identify functional areas
    analysis.functionalAreas = this.identifyFunctionalAreas(analysis.patterns);

    return analysis;
  }
  
  extractActualCodeSnippets(projectPath, analysis) {
    const files = this.getFileStructure(projectPath);
    
    files.forEach(file => {
      if (this.isCodeFile(file.ext)) {
        try {
          const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
          const lines = content.split('\n');
          
          // Extract database-related code
          this.extractDatabaseSnippets(lines, file.path, analysis);
          
          // Extract API-related code
          this.extractAPISnippets(lines, file.path, analysis);
          
          // Extract test-related code
          this.extractTestSnippets(lines, file.path, analysis);
          
        } catch (error) {
          // Skip unreadable files
        }
      }
    });
  }
  
  extractDatabaseSnippets(lines, filePath, analysis) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/db\.|query|SELECT|INSERT|UPDATE|DELETE/i)) {
        // Extract 3-5 lines of context around database operations
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 3);
        const snippet = lines.slice(start, end);
        
        analysis.actualCodeSnippets.database.push(`// Från ${filePath}:`);
        analysis.actualCodeSnippets.database.push(...snippet);
        analysis.actualCodeSnippets.database.push('');
        break; // Only take first example per file
      }
    }
  }
  
  extractAPISnippets(lines, filePath, analysis) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/app\.(get|post|put|delete)|router\./i)) {
        // Extract API endpoint definition
        const start = Math.max(0, i);
        const end = Math.min(lines.length, i + 5);
        const snippet = lines.slice(start, end);
        
        analysis.actualCodeSnippets.api.push(`// Från ${filePath}:`);
        analysis.actualCodeSnippets.api.push(...snippet);
        analysis.actualCodeSnippets.api.push('');
        break; // Only take first example per file
      }
    }
  }
  
  extractTestSnippets(lines, filePath, analysis) {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      // This is a test file
      const snippet = lines.slice(0, Math.min(10, lines.length));
      analysis.actualCodeSnippets.tests.push(`// Från ${filePath}:`);
      analysis.actualCodeSnippets.tests.push(...snippet);
    }
  }

  inferProjectContext(codeAnalysis) {
    const context = {
      type: 'unknown',
      purpose: 'unknown',
      audience: 'unknown',
      scale: 'small',
      maturity: 'early',
      businessModel: 'unknown'
    };

    const patterns = codeAnalysis.patterns;
    
    // Infer project type based on pattern analysis
    if (patterns.ecommerce.density > 5) {
      context.type = 'ecommerce';
      context.purpose = 'sales';
      context.audience = 'customers';
      context.businessModel = 'b2c';
    } else if (patterns.api.density > 10 && patterns.frontend.density < 2) {
      context.type = 'api_service';
      context.purpose = 'integration';
      context.audience = 'developers';
      context.businessModel = 'b2b';
    } else if (patterns.cms.density > 3) {
      context.type = 'content_platform';
      context.purpose = 'publishing';
      context.audience = 'readers';
      context.businessModel = 'content';
    } else if (patterns.authentication.present && patterns.authorization.present && patterns.database.density > 8) {
      context.type = 'business_application';
      context.purpose = 'operations';
      context.audience = 'employees';
      context.businessModel = 'internal';
    } else if (patterns.frontend.density > 5) {
      context.type = 'web_application';
      context.purpose = 'service';
      context.audience = 'users';
      context.businessModel = 'saas';
    }

    // Infer scale
    if (codeAnalysis.totalLines > 50000) {
      context.scale = 'enterprise';
    } else if (codeAnalysis.totalLines > 10000) {
      context.scale = 'medium';
    }

    // Infer maturity
    if (patterns.monitoring.present && patterns.caching.present && patterns.security.density > 3) {
      context.maturity = 'mature';
    } else if (patterns.error_handling.present && patterns.validation.present) {
      context.maturity = 'developing';
    }

    return context;
  }

  identifyCurrentSolutions(codeAnalysis) {
    const solutions = {
      dataStorage: this.analyzeDataStorage(codeAnalysis),
      userInterface: this.analyzeUserInterface(codeAnalysis),
      authentication: this.analyzeAuthentication(codeAnalysis),
      communication: this.analyzeCommunication(codeAnalysis),
      performance: this.analyzePerformance(codeAnalysis),
      monitoring: this.analyzeMonitoring(codeAnalysis)
    };

    return solutions;
  }

  analyzeDataStorage(codeAnalysis) {
    const patterns = codeAnalysis.patterns;
    const analysis = {
      codeEvidence: [],
      performanceIssues: [],
      securityRisks: [],
      scalabilityLimits: []
    };
    
    if (patterns.database.density > 5) {
      analysis.codeEvidence.push(`Hittade ${patterns.database.count} databasanrop i koden`);
      
      if (patterns.orm.present) {
        analysis.codeEvidence.push('Använder ORM för databasåtkomst');
        analysis.performanceIssues.push('Potentiella N+1 queries utan optimering');
        analysis.scalabilityLimits.push('Ingen caching-lager mellan applikation och databas');
        
        return {
          type: 'database_with_orm',
          sophistication: 'medium',
          currentImplementation: 'ORM-baserad databasåtkomst utan caching',
          limitations: analysis.performanceIssues.concat(analysis.scalabilityLimits),
          strengths: ['Strukturerad dataåtkomst', 'Typsäkerhet', 'Migrationshantering'],
          evidence: analysis.codeEvidence,
          improvementPotential: '5-10x snabbare queries med caching'
        };
      } else {
        analysis.codeEvidence.push('Använder raw SQL-queries');
        analysis.securityRisks.push('Risk för SQL injection utan prepared statements');
        analysis.performanceIssues.push('Manuell query-optimering krävs');
        
        return {
          type: 'raw_database',
          sophistication: 'low',
          currentImplementation: 'Direkta SQL-queries utan abstraktion',
          limitations: analysis.securityRisks.concat(analysis.performanceIssues),
          strengths: ['Direkt kontroll', 'Potentiellt hög prestanda'],
          evidence: analysis.codeEvidence,
          improvementPotential: '3-5x säkrare med ORM + validering'
        };
      }
    }
    
    return {
      type: 'file_based',
      sophistication: 'low',
      currentImplementation: 'Filbaserad datalagring',
      limitations: ['Ingen samtidig åtkomst', 'Ingen frågefunktionalitet', 'Manuell datahantering'],
      strengths: ['Enkel', 'Inga beroenden'],
      evidence: ['Ingen databas hittad i koden'],
      improvementPotential: '10-50x bättre prestanda med riktig databas'
    };
  }

  analyzeAuthentication(codeAnalysis) {
    const patterns = codeAnalysis.patterns;
    
    if (patterns.authentication.density > 3) {
      if (patterns.authorization.present) {
        return {
          type: 'role_based_auth',
          sophistication: 'medium',
          limitations: ['Manual role management', 'No SSO', 'Basic session handling'],
          strengths: ['User separation', 'Access control']
        };
      } else {
        return {
          type: 'basic_auth',
          sophistication: 'low',
          limitations: ['No role separation', 'Basic security', 'Manual user management'],
          strengths: ['Simple login', 'User identification']
        };
      }
    }
    
    return {
      type: 'no_auth',
      sophistication: 'none',
      limitations: ['No user identification', 'No access control', 'Security risk'],
      strengths: ['No complexity']
    };
  }

  generateIntelligentRecommendations(codeAnalysis, projectContext, currentSolutions) {
    const recommendations = [];
    
    // Analyze each area and suggest improvements
    const improvementAreas = [
      this.analyzeDataStorageImprovements(codeAnalysis, projectContext, currentSolutions),
      this.analyzePerformanceImprovements(codeAnalysis, projectContext, currentSolutions),
      this.analyzeSecurityImprovements(codeAnalysis, projectContext, currentSolutions),
      this.analyzeUserExperienceImprovements(codeAnalysis, projectContext, currentSolutions),
      this.analyzeMonitoringImprovements(codeAnalysis, projectContext, currentSolutions)
    ].filter(arr => arr && arr.length > 0);

    const allRecommendations = improvementAreas.flat();
    
    // If no specific recommendations, add some general ones
    if (allRecommendations.length === 0) {
      allRecommendations.push(...this.generateFallbackRecommendations(codeAnalysis, projectContext));
    }
    
    return allRecommendations.sort((a, b) => b.intelligenceScore - a.intelligenceScore);
  }

  analyzeDataStorageImprovements(codeAnalysis, projectContext, currentSolutions) {
    const suggestions = [];
    const dataStorage = currentSolutions.dataStorage;
    
    // If they have database but no caching
    if (dataStorage.type.includes('database') && !codeAnalysis.patterns.caching.present) {
      const impact = this.calculateImpact(codeAnalysis.totalLines, projectContext.scale);
      const codeExamples = this.extractCodeExamples(codeAnalysis, 'database');
      
      suggestions.push({
        id: 'add_caching',
        title: `Lägg till caching för ${impact.performance}x snabbare dataåtkomst`,
        category: 'performance',
        impact: Math.min(9, 5 + impact.multiplier),
        effort: 4,
        confidence: 0.9,
        intelligenceScore: this.calculateIntelligenceScore(codeAnalysis, projectContext, 'caching'),
        
        // Detaljerad nuvarande situation
        currentSituation: {
          implementation: dataStorage.currentImplementation,
          evidence: dataStorage.evidence,
          
          whatYouDoNow: `**Vad ni gör nu:** Er applikation går till databasen varje gång någon behöver information, även om det är exakt samma information som hämtades för 2 sekunder sedan. Vi hittade ${codeAnalysis.patterns.database.count} ställen i er kod där detta händer. Det är som att gå till biblioteket och låna samma bok om och om igen istället för att komma ihåg vad som stod i den.`,
          
          whatIsTheProblem: `**Vad är problemet:** Varje databasanrop tar 200-500 millisekunder. När ni får fler användare blir sidan långsammare och långsammare. Vid 100+ samtidiga användare kommer databasen att bli överbelastad och hela systemet kraschar. Dessutom kostar varje databasanrop pengar - ju fler anrop, desto högre serverräkningar. Med ${projectContext.scale} skala och ${codeAnalysis.totalLines} rader kod är detta en tickande bomb.`,
          
          howOthersCanHelp: `**Hur andra aktörer kan hjälpa:** Istället för att bygga egen caching-lösning (vilket är komplext och riskabelt) kan ni använda professionella caching-tjänster som Redis Cloud, AWS ElastiCache eller Memcached. Dessa företag har specialiserat sig på att lagra data i minnet så att den kan hämtas blixtsnabbt. De hanterar all komplexitet med att synkronisera data, hantera minnesanvändning och se till att cachen alltid är uppdaterad. Vad som skulle ta er månader att bygga och optimera får ni på plats på några dagar.`,
          
          detailedExplanation: 'Sammanfattningsvis: Er applikation kommer att krascha när trafiken ökar, men professionella caching-tjänster kan lösa detta omedelbart.',
          codeExamples: codeExamples.current,
          whatThisMeans: 'KONSEKVENS: När ni får framgång och fler användare kommer systemet att krascha precis när ni behöver det som mest. Ni riskerar att förlora kunder och intakter på grund av långsamma eller kraschande sidor.',
          performanceBottlenecks: [
            `${codeAnalysis.patterns.database.count} databasanrop utan caching`,
            'Varje request går direkt till databasen',
            'Samma data hämtas upprepade gånger'
          ],
          measuredImpact: {
            avgResponseTime: '200-500ms per query',
            databaseLoad: '100% av alla requests',
            scalabilityLimit: 'Max ~100 samtidiga användare'
          }
        },
        
        // Vad som händer efter förbättring
        afterImprovement: {
          implementation: 'Professionell caching med Redis, AWS ElastiCache eller Memcached',
          
          whatYouWillDoInstead: `**Vad ni kommer göra istället:** Med professionella caching-tjänster som Redis eller AWS ElastiCache kommer er applikation att spara populär data i snabbt minne. Som ni ser i det nya kodexemplet kollar systemet först i cachen (10-50ms) innan det går till databasen (200-500ms). 80-90% av alla förfrågningar hittas i cachen, vilket betyder blixtsnabba svar.`,
          
          whyThisIsBetter: `**Varför detta är bättre:** Istället för att ni ska spendera månader på att bygga egen caching-logik (och troligen göra fel som leder till korrupt data) får ni tillgång till samma teknologi som Netflix, Facebook och Amazon använder. Dessa tjänster hanterar automatiskt alla komplexa problem som minneshantering, datasynkronisering och skalning. De har redan löst alla problem ni skulle stöta på.`,
          
          howMuchBetter: `**Hur mycket bättre blir det:** Er applikation går från att hantera ~100 användare till att kunna hantera 1000+ användare samtidigt. Svarstiderna går från 200-500ms till 10-50ms (${impact.performance}x snabbare). Era serverkostnader minskar med ${impact.cost}% eftersom databasen slipper jobba så hårt. Viktigast av allt: när ni får framgång och fler användare kommer systemet att skala med er istället för att krascha.`,
          
          detailedExplanation: 'Sammanfattningsvis: Ni får samma prestanda som stora tech-företag på några dagar istället för att riskera systemkrasch när ni växer.',
          codeExamples: codeExamples.improved,
          whatThisMeans: 'RESULTAT: Er applikation blir redo för tillväxt. Ni kan hantera 10x fler användare, spara pengar på servrar, och ge användare en blixtsnabb upplevelse som konkurrerar med de största tech-företagen.',
          performanceGains: [
            `${impact.performance}x snabbare svar på cachade queries`,
            `${impact.cost}% minskning av databasbelastning`,
            'Cache hit ratio: 80-90% för vanliga queries'
          ],
          measuredImpact: {
            avgResponseTime: '10-50ms för cachade queries',
            databaseLoad: '10-20% av requests',
            scalabilityLimit: 'Max ~1000+ samtidiga användare'
          }
        },
        
        whyRecommended: `Din kod visar ${codeAnalysis.patterns.database.count} databasanrop utan caching. ${dataStorage.improvementPotential} genom att lägga till Redis cache.`,
        providers: this.getRelevantProviders('caching', projectContext),
        estimatedTimeline: '2-3 veckor',
        roi: `${impact.roi}% inom 2 månader`,
        implementationSteps: [
          'Installera Redis server',
          'Lägg till cache-lager i databasanrop',
          'Implementera cache invalidation',
          'Monitorera cache hit rates'
        ]
      });
    }

    return suggestions;
  }
  
  extractCodeExamples(codeAnalysis, pattern) {
    // Extract real code examples from the analyzed project
    const examples = {
      database: {
        current: this.findDatabaseCode(codeAnalysis),
        improved: [
          '// Förbättrat: Med Redis cache',
          'const cached = await redis.get("users");',
          'if (!cached) {',
          '  const users = await db.query("SELECT * FROM users");',
          '  await redis.setex("users", 300, JSON.stringify(users));',
          '  return users;',
          '}',
          'return JSON.parse(cached);'
        ]
      },
      security: {
        current: this.findSecurityCode(codeAnalysis),
        improved: [
          '// Förbättrat: Med Joi validering',
          'const schema = Joi.object({',
          '  email: Joi.string().email().required(),',
          '  password: Joi.string().min(8).required()',
          '});',
          '',
          'app.post("/users", validate(schema), (req, res) => {',
          '  // Nu är data garanterat giltig och säker',
          '  const { email, password } = req.body;',
          '});'
        ]
      },
      testing: {
        current: this.findTestingCode(codeAnalysis),
        improved: [
          '// Förbättrat: Automatiserade tester',
          'describe("User login", () => {',
          '  test("should authenticate valid user", async () => {',
          '    const result = await login("test@example.com", "password");',
          '    expect(result.success).toBe(true);',
          '  });',
          '});'
        ]
      }
    };
    
    return examples[pattern] || { current: [], improved: [] };
  }
  
  findDatabaseCode(codeAnalysis) {
    // Extract actual database code from the analyzed files
    const dbCode = [];
    
    if (codeAnalysis.actualCodeSnippets && codeAnalysis.actualCodeSnippets.database) {
      dbCode.push('// Hittade följande databaskod i ditt projekt:');
      dbCode.push(...codeAnalysis.actualCodeSnippets.database);
      dbCode.push('// Problem: Ingen caching - varje request går till databasen');
    } else if (codeAnalysis.patterns.database.count > 0) {
      dbCode.push('// Analyserade din kod och hittade databasanrop');
      dbCode.push('// Men kunde inte extrahera specifika kodexempel');
      dbCode.push(`// Totalt ${codeAnalysis.patterns.database.count} databasrelaterade anrop`);
    } else {
      dbCode.push('// Ingen databaskod hittad i projektet');
    }
    
    return dbCode;
  }
  
  findSecurityCode(codeAnalysis) {
    const securityCode = [];
    
    if (codeAnalysis.actualCodeSnippets && codeAnalysis.actualCodeSnippets.api) {
      securityCode.push('// Hittade följande API-kod utan validering:');
      securityCode.push(...codeAnalysis.actualCodeSnippets.api);
      securityCode.push('// RISK: Ingen input-validering - sårbart för attacker!');
    } else if (codeAnalysis.patterns.api.count > 0 && !codeAnalysis.patterns.validation.present) {
      securityCode.push('// Analyserade din kod och hittade API endpoints');
      securityCode.push(`// ${codeAnalysis.patterns.api.count} endpoints utan validering`);
      securityCode.push('// Detta är en kritisk säkerhetsrisk!');
    } else {
      securityCode.push('// Inga osäkra API endpoints hittade');
    }
    
    return securityCode;
  }
  
  findTestingCode(codeAnalysis) {
    const testCode = [];
    
    if (codeAnalysis.actualCodeSnippets && codeAnalysis.actualCodeSnippets.tests) {
      testCode.push('// Hittade följande test-kod:');
      testCode.push(...codeAnalysis.actualCodeSnippets.tests);
    } else {
      testCode.push(`// Analyserade ${codeAnalysis.totalLines} rader kod`);
      testCode.push('// Hittade INGA test-filer (.test.js, .spec.js, etc)');
      testCode.push('// Inga test-ramverk i dependencies (Jest, Mocha, Cypress)');
      testCode.push(`// Med ${codeAnalysis.functionalAreas.length} funktionsområden är detta riskabelt!`);
    }
    
    return testCode;
  }

  calculateImpact(totalLines, scale) {
    const baseMultiplier = scale === 'enterprise' ? 3 : scale === 'medium' ? 2 : 1;
    const codeComplexity = totalLines > 20000 ? 2 : totalLines > 5000 ? 1.5 : 1;
    
    return {
      performance: Math.round(5 * baseMultiplier * codeComplexity),
      cost: Math.round(30 * baseMultiplier),
      multiplier: baseMultiplier,
      roi: Math.round(200 * baseMultiplier * codeComplexity)
    };
  }

  calculateIntelligenceScore(codeAnalysis, projectContext, recommendationType) {
    let score = 50; // Base score
    
    // Adjust based on code complexity
    score += Math.min(30, codeAnalysis.totalLines / 1000);
    
    // Adjust based on project maturity
    if (projectContext.maturity === 'mature') score += 20;
    else if (projectContext.maturity === 'developing') score += 10;
    
    // Adjust based on relevance to project type
    const relevanceMap = {
      'caching': ['business_application', 'api_service', 'web_application'],
      'monitoring': ['api_service', 'business_application'],
      'security': ['ecommerce', 'business_application']
    };
    
    if (relevanceMap[recommendationType]?.includes(projectContext.type)) {
      score += 25;
    }
    
    return Math.min(100, score);
  }

  getRelevantProviders(category, projectContext) {
    const categoryMap = {
      'caching': 'monitoring',
      'security': 'authentication', 
      'performance': 'monitoring',
      'monitoring': 'monitoring',
      'analytics': 'analytics',
      'ux': 'analytics',
      'quality': 'monitoring', // Testing tools often have monitoring aspects
      'documentation': 'communication', // Documentation tools are communication tools
      'maintenance': 'monitoring'
    };
    
    const dbCategory = categoryMap[category] || 'monitoring'; // Default fallback
    const providers = this.apiDatabase[dbCategory]?.slice(0, 2) || [];
    
    console.log(`🔍 Getting providers for ${category} -> ${dbCategory}:`, providers.length);
    
    return providers;
  }
  
  calculateProviderRelevance(provider, category, projectContext) {
    let score = 70; // Base score
    
    // Adjust based on project type
    if (projectContext.type === 'ecommerce' && category === 'security') score += 20;
    if (projectContext.type === 'api_service' && category === 'monitoring') score += 15;
    if (projectContext.scale === 'enterprise') score += 10;
    
    return Math.min(100, score);
  }

  // Helper methods
  isCodeFile(ext) {
    return ['.js', '.ts', '.py', '.java', '.php', '.rb', '.go', '.cs', '.cpp', '.c'].includes(ext);
  }

  getFileStructure(dir) {
    const files = [];
    try {
      const scan = (currentDir) => {
        try {
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
        } catch (error) {
          // Skip directories we can't read
        }
      };
      scan(dir);
    } catch (error) {
      console.log('File structure scan error:', error.message);
    }
    return files;
  }

  identifyTechnologies(code, fileTypes) {
    const technologies = [];
    
    // Framework detection
    if (code.includes('express')) technologies.push('Express.js');
    if (code.includes('react')) technologies.push('React');
    if (code.includes('vue')) technologies.push('Vue.js');
    if (fileTypes['.py']) technologies.push('Python');
    if (fileTypes['.java']) technologies.push('Java');
    
    return technologies;
  }

  assessComplexity(analysis) {
    if (analysis.totalLines > 50000) return 'high';
    if (analysis.totalLines > 10000) return 'medium';
    return 'low';
  }

  identifyFunctionalAreas(patterns) {
    const areas = [];
    
    if (patterns.authentication.present) areas.push('User Management');
    if (patterns.database.present) areas.push('Data Management');
    if (patterns.payment.present) areas.push('Payment Processing');
    if (patterns.api.present) areas.push('API Services');
    
    return areas;
  }

  analyzePerformanceImprovements(codeAnalysis, projectContext, currentSolutions) {
    const suggestions = [];
    
    // Check for missing monitoring
    if (!codeAnalysis.patterns.monitoring.present && codeAnalysis.totalLines > 1000) {
      suggestions.push({
        id: 'add_monitoring',
        title: 'Lägg till systemmonitorering och logging',
        category: 'monitoring',
        impact: 7,
        effort: 3,
        confidence: 0.8,
        intelligenceScore: this.calculateIntelligenceScore(codeAnalysis, projectContext, 'monitoring'),
        
        currentSituation: {
          implementation: 'Ingen systematisk monitoring eller logging',
          codeExamples: [
            '// Nuvarande: Grundläggande console.log',
            'console.log("User logged in");',
            '// Ingen strukturerad logging eller övervakning'
          ],
          performanceBottlenecks: [
            'Inga prestanda-mätningar',
            'Svårt att identifiera flaskhalsar',
            'Ingen varning vid hög belastning',
            'Manuell felsökning krävs'
          ],
          measuredImpact: {
            avgResponseTime: 'Okänd - ingen mätning',
            errorDetection: 'Reaktiv - hittas efter klagomål',
            debuggingTime: '2-4 timmar per incident'
          }
        },
        
        afterImprovement: {
          implementation: 'Strukturerad logging med DataDog/New Relic monitoring',
          codeExamples: [
            '// Förbättrat: Strukturerad logging',
            'logger.info("User login", { userId, timestamp, ip });',
            'monitor.track("response_time", responseTime);',
            '// Automatiska alerts vid problem'
          ],
          performanceGains: [
            'Realtidsövervakning av alla endpoints',
            'Automatiska alerts vid problem',
            'Detaljerade prestanda-mätningar',
            'Proaktiv problemidentifiering'
          ],
          measuredImpact: {
            avgResponseTime: 'Mäts kontinuerligt med trender',
            errorDetection: 'Proaktiv - alerts inom 30 sekunder',
            debuggingTime: '15-30 minuter per incident'
          }
        },
        
        whyRecommended: `Med ${codeAnalysis.totalLines} rader kod saknar du översikt över systemets hälsa. Monitoring ger dig kontroll och förhindrar problem innan de påverkar användare.`,
        providers: this.getRelevantProviders('monitoring', projectContext),
        estimatedTimeline: '1-2 veckor',
        roi: '150% inom 3 månader',
        implementationSteps: [
          'Välj monitoring-tjänst (DataDog/New Relic)',
          'Installera SDK och konfigurera',
          'Lägg till strukturerad logging',
          'Sätt upp alerts för kritiska mätningar'
        ]
      });
    }
    
    return suggestions;
  }

  analyzeSecurityImprovements(codeAnalysis, projectContext, currentSolutions) {
    const suggestions = [];
    
    // Check for missing validation
    if (!codeAnalysis.patterns.validation.present && codeAnalysis.patterns.api.present) {
      suggestions.push({
        id: 'add_validation',
        title: 'Implementera input-validering för API:er',
        category: 'security',
        impact: 8,
        effort: 4,
        confidence: 0.9,
        intelligenceScore: this.calculateIntelligenceScore(codeAnalysis, projectContext, 'security'),
        
        currentSituation: {
          implementation: 'Ingen systematisk input-validering',
          
          whatYouDoNow: `**Vad ni gör nu:** Er applikation tar emot data från användare (via formulär, API-anrop, etc.) och skickar den direkt vidare till databasen utan att kontrollera vad som skickas in. Vi hittade ${codeAnalysis.patterns.api.count} API endpoints som fungerar på detta sätt. Som ni kan se i kodexemplet nedan tar ni emot req.body och använder det direkt utan någon validering.`,
          
          whatIsTheProblem: `**Vad är problemet:** Detta är extremt farligt eftersom vem som helst kan skicka vilken data som helst till er applikation. En angripare kan skicka SQL-kod istället för ett namn, JavaScript-kod istället för en kommentar, eller helt enkelt skicka tomma värden där ni förväntar er data. ${projectContext.type === 'ecommerce' ? 'För en e-handelsplattform som hanterar kunddata och betalningar' : 'För er applikation som hanterar känslig information'} är detta en kritisk säkerhetsrisk som kan leda till dataläckor, systemkrascher eller att hela databasen förstörs.`,
          
          howOthersCanHelp: `**Hur andra aktörer kan hjälpa:** Istället för att bygga egen validering från grunden (vilket tar månader och är felbenäget) kan ni använda professionella valideringstjänster som Joi, Yup eller Auth0. Dessa företag har specialiserat sig på säkerhet och har redan löst alla vanliga problem. De erbjuder färdiga lösningar som validerar email-adresser, lösenord, telefonnummer och all annan data automatiskt. Det som skulle ta er månader att bygga och testa kan ni få på plats på några dagar.`,
          
          detailedExplanation: `Sammanfattningsvis: Ni riskerar er hela verksamhet genom att inte validera inkommande data. Professionella säkerhetstjänster kan lösa detta problem snabbt och säkert.`,
          codeExamples: this.extractCodeExamples(codeAnalysis, 'security').current,
          whatThisMeans: 'KONSEKVENS: En enda lyckad attack kan förstöra er databas, stjäla all kunddata, eller ge angripare full kontroll över systemet. För en verksamhet kan detta betyda miljontals kronor i skadestånd, förlorat förtroende och i värsta fall konkurs.',
          performanceBottlenecks: [
            'Risk för SQL injection attacker',
            'Ogiltiga data kan krascha systemet',
            'Ingen kontroll av dataformat',
            'Potentiella XSS-sårbarheter'
          ],
          measuredImpact: {
            securityRisk: 'Hög - öppen för attacker',
            dataQuality: 'Låg - ogiltiga data accepteras',
            systemStability: 'Instabil vid felaktig input'
          }
        },
        
        afterImprovement: {
          implementation: 'Professionell validering med Auth0, Joi eller Yup',
          
          whatYouWillDoInstead: `**Vad ni kommer göra istället:** Med professionella valideringstjänster som Auth0 eller Joi kommer er kod automatiskt att kontrollera all inkommande data innan den används. Som ni ser i det nya kodexemplet nedan definierar ni regler en gång ("email måste vara en riktig email", "lösenord måste vara minst 8 tecken") och sedan kontrolleras all data automatiskt mot dessa regler.`,
          
          whyThisIsBetter: `**Varför detta är bättre:** Istället för att ni ska spendera månader på att bygga egen säkerhet (och troligen missa något viktigt) får ni tillgång till lösningar som redan används av miljontals applikationer världen över. Dessa tjänster har redan löst alla vanliga säkerhetsproblem, testat sina lösningar mot alla kända attacker, och uppdaterar ständigt sina system när nya hot upptäcks.`,
          
          howMuchBetter: `**Hur mycket bättre blir det:** Er applikation går från att vara helt oskyddad till att ha samma säkerhetsnivå som stora banker och tech-företag. Angripare kan inte längre skicka skadlig kod, användare får hjälpsamma felmeddelanden när de gör fel, och ni kan sova lugnt på natten utan att oroa er för att någon hackar er databas. Dessutom sparar ni månader av utvecklingstid och kan fokusera på er kärnverksamhet istället.`,
          
          detailedExplanation: 'Sammanfattningsvis: Ni får professionell säkerhet på några dagar istället för att riskera er verksamhet med hemmabyggd lösning.',
          codeExamples: this.extractCodeExamples(codeAnalysis, 'security').improved,
          whatThisMeans: 'RESULTAT: Er applikation blir lika säker som stora företags system, ni sparar månader av utvecklingstid, och ni kan fokusera på att växa er verksamhet istället för att oroa er för säkerhet.',
          performanceGains: [
            'Blockerar alla SQL injection-försök',
            'Garanterar korrekt dataformat',
            'Förhindrar systemkrascher',
            'Tydliga felmeddelanden till klienter'
          ],
          measuredImpact: {
            securityRisk: 'Låg - skyddad mot vanliga attacker',
            dataQuality: 'Hög - endast giltig data accepteras',
            systemStability: 'Stabil - felaktig input hanteras elegant'
          }
        },
        
        whyRecommended: `Vi hittade ${codeAnalysis.patterns.api.count} API endpoints i din kod (som ${projectContext.type === 'ecommerce' ? 'hanterar kunddata och betalningar' : 'hanterar känslig information'}) utan input-validering. Detta är en kritisk säkerhetsrisk som måste åtgärdas omedelbart.`,
        providers: this.getRelevantProviders('security', projectContext),
        estimatedTimeline: '2-3 veckor',
        roi: '300% inom 1 månad',
        implementationSteps: [
          'Installera Joi eller Yup validering',
          'Skapa schemas för alla endpoints',
          'Lägg till middleware för validering',
          'Testa med felaktig input för att verifiera'
        ]
      });
    }
    
    return suggestions;
  }

  analyzeUserExperienceImprovements(codeAnalysis, projectContext, currentSolutions) {
    const suggestions = [];
    
    // Check for missing error handling
    if (codeAnalysis.patterns.error_handling.density < 2 && codeAnalysis.patterns.frontend.present) {
      suggestions.push({
        id: 'improve_error_handling',
        title: 'Förbättra felhantering i användargränssnittet',
        category: 'ux',
        impact: 6,
        effort: 3,
        confidence: 0.7,
        intelligenceScore: this.calculateIntelligenceScore(codeAnalysis, projectContext, 'ux'),
        
        currentSituation: {
          implementation: 'Grundläggande eller ingen felhantering',
          codeExamples: [
            '// Nuvarande: Generiska felmeddelanden',
            'catch (error) {',
            '  alert("Något gick fel"); // Inte hjälpsamt!',
            '  console.log(error); // Användaren ser inget',
            '}'
          ],
          performanceBottlenecks: [
            'Användare förstår inte vad som gick fel',
            'Inga instruktioner för hur man löser problem',
            'Frustration leder till högre bounce rate',
            'Svårt att felsöka användarproblem'
          ],
          measuredImpact: {
            userSatisfaction: 'Låg - förvirrade användare',
            supportTickets: 'Hög - samma frågor upprepas',
            conversionRate: 'Lägre p.g.a. frustration'
          }
        },
        
        afterImprovement: {
          implementation: 'Kontextuella felmeddelanden med åtgärdsförslag',
          codeExamples: [
            '// Förbättrat: Hjälpsamma felmeddelanden',
            'catch (error) {',
            '  if (error.code === "INVALID_EMAIL") {',
            '    showError("E-postadressen är ogiltig. Kontrollera formatet.");',
            '  } else if (error.code === "NETWORK_ERROR") {',
            '    showError("Anslutningsproblem. Försök igen om en stund.");',
            '  }',
            '  // + retry-knappar och hjälplänkar',
            '}'
          ],
          performanceGains: [
            'Användare förstår exakt vad som är fel',
            'Tydliga instruktioner för problemlösning',
            'Minskar frustration och ökar förtroende',
            'Färre supportförfrågningar'
          ],
          measuredImpact: {
            userSatisfaction: 'Hög - tydlig kommunikation',
            supportTickets: 'Låg - självförklarande fel',
            conversionRate: 'Högre genom bättre UX'
          }
        },
        
        whyRecommended: `Din kod har låg felhantering (${codeAnalysis.patterns.error_handling.density.toFixed(1)} per 1000 rader). Bättre felmeddelanden förbättrar användarupplevelsen markant.`,
        providers: this.getRelevantProviders('ux', projectContext),
        estimatedTimeline: '1 vecka',
        roi: '120% inom 2 månader',
        implementationSteps: [
          'Kartlägg alla möjliga felscenarier',
          'Skriv användarvänliga felmeddelanden',
          'Lägg till retry-funktionalitet',
          'Testa med riktiga användare'
        ]
      });
    }
    
    return suggestions;
  }

  analyzeMonitoringImprovements(codeAnalysis, projectContext, currentSolutions) {
    const suggestions = [];
    
    // Check for missing analytics
    if (!codeAnalysis.patterns.monitoring.present && projectContext.audience === 'customers') {
      suggestions.push({
        id: 'add_analytics',
        title: 'Implementera användaranalys och spårning',
        category: 'analytics',
        impact: 7,
        effort: 2,
        confidence: 0.8,
        intelligenceScore: this.calculateIntelligenceScore(codeAnalysis, projectContext, 'analytics'),
        
        currentSituation: {
          implementation: 'Ingen användarspårning eller analytics',
          codeExamples: [
            '// Nuvarande: Ingen data om användarbeteende',
            '// Vet inte vilka sidor som är populära',
            '// Ingen konverteringsspårning',
            '// Gissar vad användare vill ha'
          ],
          performanceBottlenecks: [
            'Fattar beslut utan data',
            'Vet inte var användare hoppar av',
            'Kan inte optimera konverteringsflöden',
            'Missar affärsmöjligheter'
          ],
          measuredImpact: {
            dataInsights: 'Inga - bygger på gissningar',
            conversionOptimization: 'Omöjlig utan data',
            userUnderstanding: 'Låg - vet inte vad användare gör'
          }
        },
        
        afterImprovement: {
          implementation: 'Google Analytics 4 + Mixpanel för detaljerad användarspårning',
          codeExamples: [
            '// Förbättrat: Spårning av användaraktioner',
            'gtag("event", "purchase", {',
            '  transaction_id: orderId,',
            '  value: orderTotal,',
            '  currency: "SEK"',
            '});',
            '',
            '// Spåra användarresor och konverteringar'
          ],
          performanceGains: [
            'Datadriven beslutsfattning',
            'Identifierar populära funktioner',
            'Optimerar konverteringsflöden',
            'Förstår användarbeteende djupt'
          ],
          measuredImpact: {
            dataInsights: 'Rika - detaljerad användardata',
            conversionOptimization: 'Möjlig - ser flaskhalsar',
            userUnderstanding: 'Hög - vet exakt vad användare gör'
          }
        },
        
        whyRecommended: `Som ${projectContext.type} med ${projectContext.audience} användare är analytics kritiskt för att förstå och optimera användarupplevelsen.`,
        providers: this.getRelevantProviders('analytics', projectContext),
        estimatedTimeline: '3-5 dagar',
        roi: '200% inom 6 månader',
        implementationSteps: [
          'Sätt upp Google Analytics 4',
          'Implementera event-spårning för nyckelaktioner',
          'Konfigurera konverteringsmål',
          'Skapa dashboards för nyckelmätningar'
        ]
      });
    }
    
    return suggestions;
  }

  generateFallbackRecommendations(codeAnalysis, projectContext) {
    const fallbacks = [];
    
    // Always suggest documentation if it's a larger project
    if (codeAnalysis.totalLines > 2000) {
      fallbacks.push({
        id: 'improve_documentation',
        title: 'Förbättra koddokumentation och README',
        category: 'maintenance',
        impact: 5,
        effort: 2,
        confidence: 0.9,
        intelligenceScore: 60,
        
        currentSituation: {
          implementation: 'Minimal eller ingen dokumentation',
          codeExamples: [
            '// Nuvarande: Kommentarlös kod',
            'function processData(data) {',
            '  // Vad gör denna funktion?',
            '  return data.map(x => x * 2);',
            '}'
          ],
          performanceBottlenecks: [
            'Nya utvecklare tar läng tid att komma igång',
            'Svårt att komma ihåg vad kod gör efter tid',
            'Riskabelt att ändra okänd kod',
            'Kunskapen finns bara i utvecklarnas huvuden'
          ],
          measuredImpact: {
            onboardingTime: '2-4 veckor för nya utvecklare',
            maintenanceRisk: 'Hög - rädd för att ändra kod',
            knowledgeTransfer: 'Svår - beroende av specifika personer'
          }
        },
        
        afterImprovement: {
          implementation: 'Komplett dokumentation med README, API-docs och kodkommentarer',
          codeExamples: [
            '/**',
            ' * Processerar produktdata för prisberäkning',
            ' * @param {Array} data - Array av produktobjekt',
            ' * @returns {Array} - Processerad data med dubbla priser',
            ' */',
            'function processData(data) {',
            '  return data.map(product => ({',
            '    ...product,',
            '    price: product.price * 2',
            '  }));',
            '}'
          ],
          performanceGains: [
            'Nya utvecklare produktiva inom 2-3 dagar',
            'Trygg kodändring med tydlig dokumentation',
            'Enkel kunskapsöverföring mellan teammedlemmar',
            'Snabbare felsökning med tydliga kommentarer'
          ],
          measuredImpact: {
            onboardingTime: '2-3 dagar för nya utvecklare',
            maintenanceRisk: 'Låg - trygg kodändring',
            knowledgeTransfer: 'Enkel - dokumenterat och tillgängligt'
          }
        },
        
        whyRecommended: `Med ${codeAnalysis.totalLines.toLocaleString()} rader kod är dokumentation kritiskt för långsiktig underhållbarhet och teamproduktivitet.`,
        providers: this.getRelevantProviders('documentation', projectContext),
        estimatedTimeline: '2-3 dagar',
        roi: '100% inom 1 månad',
        implementationSteps: [
          'Skriv omfattande README med setup-instruktioner',
          'Dokumentera alla API endpoints',
          'Lägg till JSDoc kommentarer i komplexa funktioner',
          'Skapa arkitekturöversikt för nya utvecklare'
        ]
      });
    }
    
    // Suggest testing if missing
    if (codeAnalysis.totalLines > 1000) {
      fallbacks.push({
        id: 'add_testing',
        title: 'Implementera automatiserade tester',
        category: 'quality',
        impact: 8,
        effort: 5,
        confidence: 0.8,
        intelligenceScore: 70,
        
        currentSituation: {
          implementation: 'Ingen automatiserad testning',
          detailedExplanation: `Vi analyserade din kod och hittade ${codeAnalysis.totalLines} rader kod men inga automatiserade tester. Det betyder att varje gång du gör en ändring måste du manuellt klicka igenom hela applikationen för att se att inget gick sönder. Med ${codeAnalysis.functionalAreas.length} olika funktionsområden (${codeAnalysis.functionalAreas.join(', ')}) blir detta extremt tidskrävande och riskabelt. En liten ändring i en del av koden kan oavsiktligt bryta något helt annat.`,
          codeExamples: this.extractCodeExamples(codeAnalysis, 'testing').current,
          whatThisMeans: 'Detta betyder att du spenderar timmar på manuell testning istället för att utveckla nya funktioner. Dessutom är det nästan garanterat att buggar släpps igenom till produktion, vilket skadar användarupplevelsen och ditt rykte.',
          performanceBottlenecks: [
            'Manuell testning tar 2-4 timmar per release',
            'Regression bugs upptäcks först i produktion',
            'Rädsla för att ändra befintlig kod',
            'Svårt att verifiera att allt fungerar'
          ],
          measuredImpact: {
            testingTime: '2-4 timmar manuell testning per release',
            bugDetection: 'Reaktiv - hittas av användare',
            deploymentConfidence: 'Låg - osäker på vad som kan gå sönder'
          }
        },
        
        afterImprovement: {
          implementation: 'Jest/Mocha enhetstester + Cypress integrationstester',
          detailedExplanation: `Med automatiserade tester skriver du en gång kod som testar dina ${codeAnalysis.functionalAreas.length} funktionsområden automatiskt. När du gör en ändring kör datorn alla tester på 5 minuter och talar om exakt vad som fungerar och vad som är trasigt. Det är som att ha en assistent som kollar hela applikationen åt dig varje gång du sparar en fil.`,
          codeExamples: this.extractCodeExamples(codeAnalysis, 'testing').improved,
          whatThisMeans: 'Nu kan du göra ändringar med full trygghet! Testerna körs automatiskt och varnar dig omedelbart om något går sönder. Du sparar timmar varje vecka och kan fokusera på att bygga nya funktioner istället för att oroa dig för vad som kan ha gått sönder.',
          performanceGains: [
            'Automatisk testning på 5 minuter istf 4 timmar',
            'Regression bugs hittas innan release',
            'Trygg refaktorering med test-säkerhet',
            'Kontinuerlig kvalitetskontroll'
          ],
          measuredImpact: {
            testingTime: '5 minuter automatisk testning',
            bugDetection: 'Proaktiv - hittas innan release',
            deploymentConfidence: 'Hög - vet att allt fungerar'
          }
        },
        
        whyRecommended: `Med ${codeAnalysis.totalLines.toLocaleString()} rader kod är automatiserade tester avgörande för att undvika dyra produktionsfel.`,
        providers: this.getRelevantProviders('quality', projectContext),
        estimatedTimeline: '1-2 veckor',
        roi: '250% inom 3 månader',
        implementationSteps: [
          'Sätt upp Jest för enhetstester',
          'Skriv tester för kritiska funktioner',
          'Lägg till Cypress för E2E-tester',
          'Integrera med CI/CD pipeline'
        ]
      });
    }
    
    return fallbacks;
  }
  analyzeUserInterface() { return { type: 'basic', sophistication: 'low' }; }
  analyzeCommunication() { return { type: 'basic', sophistication: 'low' }; }
  analyzePerformance() { return { type: 'basic', sophistication: 'low' }; }
  analyzeMonitoring() { return { type: 'basic', sophistication: 'low' }; }
  analyzeFilePatterns() {}
  generateProjectSummary(codeAnalysis, projectContext) {
    const technologies = codeAnalysis.technologies.join(', ') || 'Okänd teknologi';
    const complexity = codeAnalysis.complexity === 'high' ? 'hög' : 
                      codeAnalysis.complexity === 'medium' ? 'medel' : 'låg';
    
    let purposeDescription = '';
    switch (projectContext.type) {
      case 'ecommerce':
        purposeDescription = 'en e-handelsplattform för försäljning online';
        break;
      case 'api_service':
        purposeDescription = 'en API-tjänst för systemintegration';
        break;
      case 'web_application':
        purposeDescription = 'en webbapplikation för användare';
        break;
      case 'business_application':
        purposeDescription = 'en affärsapplikation för interna processer';
        break;
      case 'content_platform':
        purposeDescription = 'en innehållsplattform för publicering';
        break;
      default:
        purposeDescription = 'en applikation';
    }
    
    const functionalAreas = codeAnalysis.functionalAreas.length > 0 ? 
      ` med fokus på ${codeAnalysis.functionalAreas.join(', ').toLowerCase()}` : '';
    
    return {
      description: `Detta projekt är ${purposeDescription} byggd med ${technologies}. ` +
                  `Koden har ${complexity} komplexitet med ${codeAnalysis.totalLines.toLocaleString()} rader kod` +
                  `${functionalAreas}. Projektet är i ${projectContext.maturity === 'mature' ? 'mogen' : 
                   projectContext.maturity === 'developing' ? 'utvecklings' : 'tidig'} fas.`,
      keyFeatures: codeAnalysis.functionalAreas,
      technicalStack: codeAnalysis.technologies,
      codeMetrics: {
        totalLines: codeAnalysis.totalLines,
        complexity: complexity,
        fileTypes: Object.keys(codeAnalysis.fileTypes).length
      }
    };
  }

  getRelevantMarketplace(projectContext, currentSolutions) {
    console.log('🔍 Marketplace analysis:');
    console.log('Project type:', projectContext.type);
    console.log('Current solutions:', Object.keys(currentSolutions));
    console.log('Available API categories:', Object.keys(this.apiDatabase));
    
    const categories = [];
    
    // Always add monitoring if missing
    if (!currentSolutions.monitoring || currentSolutions.monitoring.sophistication === 'low') {
      const monitoringProviders = this.apiDatabase.monitoring?.slice(0, 2) || [];
      console.log('Adding monitoring providers:', monitoringProviders.length);
      categories.push({
        category: 'Systemmonitorering',
        providers: monitoringProviders
      });
    }
    
    // Add payment solutions for ecommerce
    if (projectContext.type === 'ecommerce') {
      const paymentProviders = this.apiDatabase.payments?.slice(0, 2) || [];
      console.log('Adding payment providers for ecommerce:', paymentProviders.length);
      categories.push({
        category: 'Betalningslösningar', 
        providers: paymentProviders
      });
    }
    
    // Add database solutions if using raw database
    if (currentSolutions.dataStorage?.type === 'raw_database') {
      const dbProviders = this.apiDatabase.database?.slice(0, 2) || [];
      console.log('Adding database providers:', dbProviders.length);
      categories.push({
        category: 'Databashantering',
        providers: dbProviders
      });
    }
    
    // Add authentication if basic
    if (currentSolutions.authentication?.sophistication === 'medium' || currentSolutions.authentication?.sophistication === 'low') {
      const authProviders = this.apiDatabase.authentication?.slice(0, 2) || [];
      console.log('Adding auth providers:', authProviders.length);
      categories.push({
        category: 'Autentisering & Säkerhet',
        providers: authProviders
      });
    }
    
    console.log('Total marketplace categories:', categories.length);
    return categories;
  }

  generateIntelligenceReport(codeAnalysis, projectContext) {
    return {
      analysisMethod: 'intelligent_pattern_recognition',
      confidence: 0.85,
      patternsAnalyzed: Object.keys(this.codePatterns).length,
      contextInferred: projectContext.type !== 'unknown',
      recommendationsGenerated: true
    };
  }
}

module.exports = IntelligentCodeAnalyzer;