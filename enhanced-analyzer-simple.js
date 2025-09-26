const fs = require('fs');
const path = require('path');

class EnhancedAnalyzer {
  constructor() {
    this.apiDatabase = require('./data/comprehensive-api-database.json');
  }

  async analyzeProjectAdvanced(projectPath, scanResult) {
    const analysis = {
      ...scanResult,
      files: this.getFileStructure(projectPath),
      dependencies: this.analyzeDependencies(projectPath),
      patterns: this.detectAdvancedPatterns(projectPath),
      businessContext: this.inferBusinessContext(projectPath),
      gdprRisks: this.performGDPRScan(projectPath)
    };

    const suggestions = this.generateEnhancedSuggestions(analysis);
    const rankedSuggestions = this.rankSuggestions(suggestions, analysis);

    return {
      analysis,
      suggestions: rankedSuggestions,
      marketplace: this.getSimpleMarketplace(analysis),
      gdprCompliance: this.generateGDPRReport(analysis.gdprRisks),
      businessImpact: this.calculateSimpleBusinessImpact(rankedSuggestions)
    };
  }

  detectAdvancedPatterns(projectPath) {
    const patterns = {
      // E-commerce patterns
      hasProductCatalog: false,
      hasShoppingCart: false,
      hasCheckout: false,
      
      // Internal/Business patterns
      hasDatabase: false,
      hasDataManagement: false,
      hasReporting: false,
      hasUserManagement: false,
      hasFileManagement: false,
      hasWorkflow: false,
      
      // Technical patterns
      hasAPI: false,
      hasAuth: false,
      hasLogging: false,
      hasValidation: false,
      hasCaching: false,
      hasBackup: false,
      
      // Public-facing patterns
      hasPublicWebsite: false,
      hasCustomerFacing: false,
      hasChatbot: false,
      hasAnalytics: false,
      hasSearch: false,
      hasRecommendations: false
    };

    try {
      const files = this.getFileStructure(projectPath);
      let codeContent = '';
      
      files.forEach(file => {
        if (file.ext === '.js' || file.ext === '.ts' || file.ext === '.py' || file.ext === '.java') {
          try {
            const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
            codeContent += content + ' ';
            
            // Database patterns
            if (content.match(/database|db\.|sql|mysql|postgres|mongodb|sqlite/i)) {
              patterns.hasDatabase = true;
            }
            
            // Data management patterns
            if (content.match(/crud|create|update|delete|insert|select|query/i)) {
              patterns.hasDataManagement = true;
            }
            
            // Internal business patterns
            if (content.match(/employee|staff|internal|admin|management|inventory|report/i)) {
              patterns.hasReporting = true;
            }
            
            // File management
            if (content.match(/upload|download|file|document|storage/i)) {
              patterns.hasFileManagement = true;
            }
            
            // User management
            if (content.match(/user|login|auth|permission|role/i)) {
              patterns.hasUserManagement = true;
            }
            
            // API patterns
            if (content.match(/app\.(get|post|put|delete)|router\.|api|endpoint/i)) {
              patterns.hasAPI = true;
            }
            
            // Public-facing indicators
            if (content.match(/customer|client|public|website|landing|home/i)) {
              patterns.hasPublicWebsite = true;
            }
            
            // E-commerce specific
            if (content.match(/product|cart|checkout|payment|order/i)) {
              patterns.hasProductCatalog = true;
              patterns.hasCustomerFacing = true;
            }
            
            // Technical improvements
            if (content.match(/log|console\.|winston|bunyan/i)) {
              patterns.hasLogging = true;
            }
            
            if (content.match(/validate|joi|yup|schema/i)) {
              patterns.hasValidation = true;
            }
            
            if (content.match(/cache|redis|memcached/i)) {
              patterns.hasCaching = true;
            }
            
          } catch (error) {
            // Skip files we can't read
          }
        }
      });
      
      // Determine if it's customer-facing based on overall content
      const publicKeywords = (codeContent.match(/customer|client|public|website|shop|buy|sell/gi) || []).length;
      const internalKeywords = (codeContent.match(/employee|staff|internal|admin|management|inventory/gi) || []).length;
      
      patterns.hasCustomerFacing = publicKeywords > internalKeywords;
      
    } catch (error) {
      console.log('Pattern detection error:', error.message);
    }

    return patterns;
  }

  inferBusinessContext(projectPath) {
    let context = {
      type: 'internal_tool',
      audience: 'internal',
      purpose: 'data_management',
      scale: 'small',
      industry: 'general'
    };

    try {
      const files = this.getFileStructure(projectPath);
      let allContent = '';
      
      // Analyze package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = Object.keys(pkg.dependencies || {});
        const description = (pkg.description || '').toLowerCase();
        
        // Collect all code content for analysis
        files.forEach(file => {
          if (file.ext === '.js' || file.ext === '.ts' || file.ext === '.py') {
            try {
              const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
              allContent += content + ' ';
            } catch (error) {
              // Skip files we can't read
            }
          }
        });
        
        // Determine application type based on content analysis
        const ecommerceKeywords = (allContent.match(/shop|cart|product|payment|order|customer|buy|sell/gi) || []).length;
        const internalKeywords = (allContent.match(/employee|staff|admin|internal|management|inventory|report|database/gi) || []).length;
        const publicKeywords = (allContent.match(/public|website|landing|home|visitor|guest/gi) || []).length;
        const dataKeywords = (allContent.match(/database|crud|query|table|record|data|storage/gi) || []).length;
        
        // Determine context based on keyword frequency
        if (ecommerceKeywords > 5 && deps.some(d => d.includes('stripe'))) {
          context.type = 'ecommerce';
          context.audience = 'customer';
          context.purpose = 'sales';
        } else if (publicKeywords > internalKeywords && publicKeywords > 3) {
          context.type = 'public_website';
          context.audience = 'public';
          context.purpose = 'marketing';
        } else if (dataKeywords > 10 || deps.some(d => d.includes('sequelize') || d.includes('mongoose') || d.includes('prisma'))) {
          context.type = 'internal_tool';
          context.audience = 'internal';
          context.purpose = 'data_management';
        } else if (description.includes('api') || allContent.includes('express') || allContent.includes('fastify')) {
          context.type = 'api_service';
          context.audience = 'developers';
          context.purpose = 'integration';
        }
        
        // Determine scale
        if (deps.length > 50 || allContent.length > 100000) {
          context.scale = 'large';
        } else if (deps.length > 20 || allContent.length > 50000) {
          context.scale = 'medium';
        }
      }
    } catch (error) {
      console.log('Business context inference error:', error.message);
    }

    return context;
  }

  generateEnhancedSuggestions(analysis) {
    const suggestions = [];
    const { patterns, businessContext, files } = analysis;

    // Only suggest customer-facing features for customer-facing apps
    if (!patterns.hasChatbot && businessContext.audience === 'customer') {
      const currentSolution = this.analyzeCurrentSolution(files, 'support');
      suggestions.push({
        id: 'ai-chatbot',
        title: 'Uppgradera från manuell kundtjänst till AI-chatbot',
        category: 'ai-ux',
        impact: 9,
        effort: 4,
        confidence: 0.95,
        currentState: currentSolution.support,
        problemsWithCurrent: [
          'Begränsad till kontorstid - kunder får vänta på svar',
          'Samma frågor besvaras om och om igen manuellt',
          'Höga personalkostnader för grundläggande support',
          'Inkonsistenta svar från olika supportmedarbetare',
          'Svårt att skala när kundbasen växer'
        ],
        whyUpgrade: `Din nuvarande lösning ${currentSolution.support.description} fungerar men begränsar tillväxten. Med AI-chatbot får du 24/7 support som svarar konsekvent på 80% av frågorna direkt, medan ditt team fokuserar på komplexa ärenden.`,
        specificBenefitsForYou: [
          'Omedelbar respons även nattetid och helger',
          'Konsistenta, korrekta svar baserat på din dokumentation',
          'Automatisk eskalering av komplexa ärenden till rätt person',
          'Kostnadsbesparing: 60% mindre tid på repetitiva frågor',
          'Bättre kundnöjdhet genom snabbare lösningar'
        ],
        businessImpact: {
          customerSatisfaction: '+40%',
          supportCostReduction: '60%',
          responseTime: '95% snabbare'
        },
        providers: this.apiDatabase.ai_ml.filter(p => p.use_cases.includes('chatbot')).slice(0, 3).map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          pricing: provider.pricing,
          description: provider.description,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi
        })),
        estimatedTimeline: '4-8 veckor',
        roi: '300-500% inom 6 månader'
      });
    }

    // Database optimization for internal tools
    if (businessContext.type === 'internal_tool' && patterns.hasDatabase && !patterns.hasCaching) {
      suggestions.push({
        id: 'database-optimization',
        title: 'Optimera databasprestanda med caching och indexering',
        category: 'performance',
        impact: 8,
        effort: 4,
        confidence: 0.9,
        currentState: { description: 'kör direkta databasförfrågningar utan optimering' },
        problemsWithCurrent: [
          'Långsamma svar när data växer - varje förfrågan går till databasen',
          'Högt CPU-användning på databasservern',
          'Användare väntar länge på rapporter och listor',
          'Systemet blir långsammare ju mer data som läggs till',
          'Risk för timeout vid stora datamängder'
        ],
        whyUpgrade: 'Ditt interna system kommer att hantera mer data över tid. Med caching och optimering får ni snabbare svar och systemet skalar bättre när företaget växer.',
        specificBenefitsForYou: [
          'Rapporter laddas 10x snabbare med Redis-cache',
          'Databas-indexering gör sökningar blixtsnabba',
          'Mindre belastning på servern = lägre kostnader',
          'Bättre användarupplevelse för personalen',
          'Systemet klarar 100x mer data utan prestandaproblem'
        ],
        businessImpact: {
          performanceIncrease: '10x snabbare',
          serverLoad: '-70%',
          userSatisfaction: '+50%'
        },
        providers: [
          {
            name: 'Redis',
            company: 'Redis Ltd.',
            url: 'https://redis.io',
            pricing: 'Gratis (self-hosted) eller från $7/månad',
            description: 'In-memory cache för blixtsnabba databasförfrågningar',
            businessImpact: '10x snabbare dataåtkomst',
            implementationTime: '1-2 veckor',
            complexity: 'medium',
            roi: '400-600%'
          }
        ],
        estimatedTimeline: '2-4 veckor',
        roi: '400-600% inom 2 månader'
      });
    }

    // User management improvements for internal tools
    if (businessContext.type === 'internal_tool' && patterns.hasUserManagement && !patterns.hasAuth) {
      suggestions.push({
        id: 'auth-improvement',
        title: 'Förbättra säkerhet med robust autentisering och rollhantering',
        category: 'security',
        impact: 9,
        effort: 5,
        confidence: 0.95,
        currentState: { description: 'har grundläggande inloggning utan avancerad säkerhet' },
        problemsWithCurrent: [
          'Enkla lösenord och ingen tvåfaktorsautentisering',
          'Alla användare har samma behörigheter',
          'Ingen spårning av vem som ändrat vad',
          'Risk för obehörig åtkomst till känslig företagsinformation',
          'Svårt att ge tillfällig åtkomst till konsulter/partners'
        ],
        whyUpgrade: 'Ert interna system hanterar företagsdata som behöver skyddas. Modern autentisering ger säkerhet och flexibilitet för olika användarroller.',
        specificBenefitsForYou: [
          'Rollbaserad åtkomst - olika behörigheter för olika avdelningar',
          'Tvåfaktorsautentisering för extra säkerhet',
          'Audit log - se vem som gjort vad och när',
          'Single Sign-On integration med företagets system',
          'Enkel användarhantering för HR'
        ],
        businessImpact: {
          securityIncrease: '+300%',
          complianceImprovement: 'GDPR-ready',
          adminTime: '-50%'
        },
        providers: this.apiDatabase.authentication.slice(0, 2).map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          pricing: provider.pricing,
          description: provider.description,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi
        })),
        estimatedTimeline: '3-5 veckor',
        roi: '200-400% inom 6 månader'
      });
    }

    // Personalization for ecommerce only
    if (!patterns.hasRecommendations && businessContext.type === 'ecommerce') {
      const currentSolution = this.analyzeCurrentSolution(files, 'recommendations');
      suggestions.push({
        id: 'personalization',
        title: 'Uppgradera från statiska produktlistor till AI-personalisering',
        category: 'ai-business',
        impact: 10,
        effort: 7,
        confidence: 0.9,
        currentState: currentSolution.recommendations,
        problemsWithCurrent: [
          'Alla kunder ser samma produkter - ingen personalisering',
          'Manuellt curerade "populära produkter" som snabbt blir föråldrade',
          'Missar cross-sell och upsell-möjligheter',
          'Låg konvertering på produktsidor',
          'Kunder hittar inte produkter de faktiskt vill ha'
        ],
        whyUpgrade: `Din nuvarande ${currentSolution.recommendations.description} visar samma produkter för alla. AI-personalisering analyserar varje kunds beteende och visar exakt vad DE är mest troliga att köpa, vilket ökar din försäljning dramatiskt.`,
        specificBenefitsForYou: [
          'Varje kund ser produkter anpassade efter deras intressen',
          'Automatiska "kunder som köpte detta köpte också" rekommendationer',
          'Dynamisk prissättning baserat på efterfrågan',
          'Högre genomsnittlig ordervolym genom smarta upsells',
          'Kunder kommer tillbaka oftare tack vare relevanta förslag'
        ],
        businessImpact: {
          revenueIncrease: '25-40%',
          conversionRate: '+35%',
          averageOrderValue: '+20%'
        },
        providers: [
          {
            name: 'AWS Personalize',
            url: 'https://aws.amazon.com/personalize/',
            pricing: 'Från $0.05/TIU',
            description: 'Fullständigt hanterad ML-tjänst för realtidspersonalisering',
            businessImpact: '35% ökning konvertering',
            implementationTime: '8-12 veckor',
            complexity: 'high',
            roi: '400-600%'
          },
          ...this.apiDatabase.ai_ml.filter(p => p.category === 'enterprise_ai').slice(0, 2).map(provider => ({
            name: provider.name,
            company: provider.company,
            url: provider.url,
            pricing: provider.pricing,
            description: provider.description,
            businessImpact: provider.business_impact,
            implementationTime: provider.implementation_time,
            complexity: provider.complexity,
            roi: provider.roi
          }))
        ],
        estimatedTimeline: '8-12 veckor',
        roi: '400-600% inom 8 månader'
      });
    }

    // Reporting and analytics for internal tools
    if (businessContext.type === 'internal_tool' && patterns.hasDataManagement && !patterns.hasReporting) {
      suggestions.push({
        id: 'reporting-system',
        title: 'Lägg till automatisk rapportering och dataanalys',
        category: 'business_intelligence',
        impact: 8,
        effort: 6,
        confidence: 0.85,
        currentState: { description: 'hanterar data men saknar rapportering och insikter' },
        problemsWithCurrent: [
          'Ledningen får ingen översikt över verksamheten',
          'Manuell dataexport till Excel för att skapa rapporter',
          'Svårt att identifiera trender och problem i tid',
          'Ingen historisk data för jämförelser',
          'Beslut fattas utan dataunderlag'
        ],
        whyUpgrade: 'Era data är värdefulla men outnyttjade. Automatisk rapportering ger ledningen insikter för bättre beslut och effektivare verksamhet.',
        specificBenefitsForYou: [
          'Automatiska månadsrapporter skickas till ledningen',
          'Dashboards visar realtidsdata för viktiga KPI:er',
          'Trendanalys identifierar problem innan de blir stora',
          'Exportfunktioner för djupare analys',
          'Historisk data för årjämförelser'
        ],
        businessImpact: {
          decisionSpeed: '+200%',
          dataInsights: 'Helt nya möjligheter',
          manualWork: '-80%'
        },
        providers: [
          {
            name: 'Chart.js + Custom Dashboard',
            company: 'Open Source',
            url: 'https://www.chartjs.org',
            pricing: 'Gratis (utvecklingskostnad)',
            description: 'Flexibel lösning för anpassade dashboards',
            businessImpact: 'Skräddarsydda rapporter',
            implementationTime: '4-6 veckor',
            complexity: 'medium',
            roi: '300-500%'
          },
          {
            name: 'Grafana',
            company: 'Grafana Labs',
            url: 'https://grafana.com',
            pricing: 'Gratis (self-hosted)',
            description: 'Professionella dashboards och alerting',
            businessImpact: 'Enterprise-kvalitet visualisering',
            implementationTime: '2-3 veckor',
            complexity: 'low',
            roi: '250-400%'
          }
        ],
        estimatedTimeline: '4-8 veckor',
        roi: '300-500% inom 4 månader'
      });
    }

    // Advanced Search for customer-facing apps
    if (!patterns.hasSearch && businessContext.audience === 'customer') {
      const currentSolution = this.analyzeCurrentSolution(files, 'search');
      suggestions.push({
        id: 'advanced-search',
        title: 'Uppgradera från grundläggande sökning till AI-driven sökning',
        category: 'ai-ux',
        impact: 8,
        effort: 5,
        confidence: 0.85,
        currentState: currentSolution.search,
        problemsWithCurrent: [
          'Kunder måste använda exakta sökord för att hitta produkter',
          'Stavfel ger "inga resultat" istället för förslag',
          'Kan inte söka på naturligt språk som "billig röd klänning"',
          'Ingen ranking - viktiga produkter hamnar långt ner',
          'Kunder ger upp och lämnar sajten när de inte hittar'
        ],
        whyUpgrade: `Din ${currentSolution.search.description} fungerar för exakta sökningar, men AI-sökning förstår vad kunder MENAR, inte bara vad de skriver. Det betyder fler lyckade sökningar och mer försäljning.`,
        specificBenefitsForYou: [
          'Kunder hittar produkter även med stavfel eller vaga beskrivningar',
          'Automatisk synonym-hantering ("bil" = "auto" = "fordon")',
          'Visuell sökning - ladda upp bild för att hitta liknande produkter',
          'Smarta filter som anpassas efter sökresultat',
          'Personliga sökresultat baserat på tidigare köp'
        ],
        businessImpact: {
          searchConversion: '+45%',
          zeroResultsReduction: '70%',
          userEngagement: '+25%'
        },
        providers: this.apiDatabase.search.map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          pricing: provider.pricing,
          description: provider.description,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi
        })),
        estimatedTimeline: '6-10 veckor',
        roi: '250-400% inom 6 månader'
      });
    }

    // Payment optimization for ecommerce
    if (businessContext.type === 'ecommerce' && !patterns.hasCheckout) {
      const currentSolution = this.analyzeCurrentSolution(files, 'payments');
      suggestions.push({
        id: 'payment-optimization',
        title: 'Uppgradera från grundläggande betalningar till optimerad checkout',
        category: 'business',
        impact: 9,
        effort: 3,
        confidence: 0.95,
        currentState: currentSolution.payments,
        problemsWithCurrent: [
          'Kunder lämnar sajten vid checkout på grund av begränsade betalningsalternativ',
          'Ingen "buy now, pay later" - förlorar kunder som inte kan betala direkt',
          'Långsam checkout-process med många steg',
          'Ingen mobil-optimering för betalningar',
          'Missar internationella kunder på grund av begränsade valutor'
        ],
        whyUpgrade: `Din ${currentSolution.payments.description} fungerar men begränsar din försäljning. Moderna betalningslösningar ökar konvertering genom fler alternativ och smidigare upplevelse.`,
        specificBenefitsForYou: [
          'Fler betalningsalternativ = fler genomförda köp',
          'Apple Pay/Google Pay för snabb mobil-checkout',
          'Klarna/Afterpay låter kunder köpa nu, betala senare',
          'Automatisk valutakonvertering för globala kunder',
          'En-klicks checkout för återkommande kunder'
        ],
        businessImpact: {
          conversionIncrease: '15-25%',
          cartAbandonmentReduction: '20%',
          internationalSales: '+30%'
        },
        providers: this.apiDatabase.payments.slice(0, 3).map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          pricing: provider.pricing,
          description: provider.description,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi
        })),
        estimatedTimeline: '2-4 veckor',
        roi: '200-350% inom 3 månader'
      });
    }

    return suggestions;
  }

  analyzeCurrentSolution(files, type) {
    const solutions = {
      support: {
        description: 'har troligen e-post eller kontaktformulär för support',
        limitations: ['Begränsad till kontorstid', 'Manuell hantering', 'Långsamma svar']
      },
      recommendations: {
        description: 'visar statiska "populära" eller "relaterade" produkter',
        limitations: ['Samma för alla användare', 'Manuellt curerade', 'Inte personaliserade']
      },
      search: {
        description: 'grundläggande sökfunktion',
        limitations: ['Kräver exakta sökord', 'Ingen felrättning', 'Begränsad ranking']
      },
      payments: {
        description: 'grundläggande kortbetalningar',
        limitations: ['Få betalningsalternativ', 'Långsam checkout', 'Ingen mobil-optimering']
      }
    };

    return { [type]: solutions[type] || { description: 'ingen identifierad lösning', limitations: [] } };
  }

  getSimpleMarketplace(analysis) {
    const { patterns, businessContext } = analysis;
    const relevantProviders = [];

    // AI & ML recommendations
    if (!patterns.hasChatbot || !patterns.hasRecommendations) {
      relevantProviders.push({
        category: 'AI & Machine Learning',
        providers: this.apiDatabase.ai_ml.slice(0, 4).map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          description: provider.description,
          pricing: provider.pricing,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi,
          useCases: provider.use_cases
        }))
      });
    }

    // Payment recommendations for ecommerce
    if (businessContext.type === 'ecommerce' || patterns.hasProductCatalog) {
      relevantProviders.push({
        category: 'Betalningar & E-handel',
        providers: this.apiDatabase.payments.slice(0, 3).map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          description: provider.description,
          pricing: provider.pricing,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi,
          useCases: provider.use_cases
        }))
      });
    }

    // Analytics recommendations
    if (!patterns.hasAnalytics) {
      relevantProviders.push({
        category: 'Analytics & Insikter',
        providers: this.apiDatabase.analytics.slice(0, 3).map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          description: provider.description,
          pricing: provider.pricing,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi,
          useCases: provider.use_cases
        }))
      });
    }

    // Search recommendations
    if (!patterns.hasSearch) {
      relevantProviders.push({
        category: 'Sökning & Discovery',
        providers: this.apiDatabase.search.map(provider => ({
          name: provider.name,
          company: provider.company,
          url: provider.url,
          description: provider.description,
          pricing: provider.pricing,
          businessImpact: provider.business_impact,
          implementationTime: provider.implementation_time,
          complexity: provider.complexity,
          roi: provider.roi,
          useCases: provider.use_cases
        }))
      });
    }

    // Communication recommendations
    relevantProviders.push({
      category: 'Kommunikation & Marknadsföring',
      providers: this.apiDatabase.communication.slice(0, 3).map(provider => ({
        name: provider.name,
        company: provider.company,
        url: provider.url,
        description: provider.description,
        pricing: provider.pricing,
        businessImpact: provider.business_impact,
        implementationTime: provider.implementation_time,
        complexity: provider.complexity,
        roi: provider.roi,
        useCases: provider.use_cases
      }))
    });

    // Monitoring recommendations
    relevantProviders.push({
      category: 'Monitorering & Prestanda',
      providers: this.apiDatabase.monitoring.map(provider => ({
        name: provider.name,
        company: provider.company,
        url: provider.url,
        description: provider.description,
        pricing: provider.pricing,
        businessImpact: provider.business_impact,
        implementationTime: provider.implementation_time,
        complexity: provider.complexity,
        roi: provider.roi,
        useCases: provider.use_cases
      }))
    });

    return relevantProviders;
  }

  performGDPRScan(projectPath) {
    const risks = [];
    
    try {
      const files = this.getFileStructure(projectPath);
      
      files.forEach(file => {
        if (file.ext === '.js' || file.ext === '.ts') {
          try {
            const content = fs.readFileSync(path.join(projectPath, file.path), 'utf8');
            
            if (content.match(/email.*=|email.*:/gi)) {
              risks.push({
                file: file.path,
                type: 'email_collection',
                severity: 'medium',
                description: 'Samlar in e-postadresser som är personuppgifter enligt GDPR'
              });
            }
            
            if (content.match(/cookie|localStorage/gi)) {
              risks.push({
                file: file.path,
                type: 'data_storage',
                severity: 'low',
                description: 'Använder cookies/lokal lagring som kräver samtycke'
              });
            }
          } catch (error) {
            // Skip files we can't read
          }
        }
      });
    } catch (error) {
      console.log('GDPR scan error:', error.message);
    }

    return risks;
  }

  generateGDPRReport(risks) {
    return {
      totalRisks: risks.length,
      highRisk: risks.filter(r => r.severity === 'high').length,
      mediumRisk: risks.filter(r => r.severity === 'medium').length,
      lowRisk: risks.filter(r => r.severity === 'low').length,
      recommendations: [
        'Implementera cookie-banner för samtycke',
        'Lägg till privacy policy och användarvillkor',
        'Säkerställ rätt till radering av personuppgifter'
      ]
    };
  }

  calculateSimpleBusinessImpact(suggestions) {
    return {
      totalPotentialRevenue: '25-50% ökning',
      estimatedROI: '300-600%',
      implementationTime: '3-6 månader',
      priorityLevel: suggestions.length > 0 ? 'High' : 'Medium'
    };
  }

  rankSuggestions(suggestions, analysis) {
    return suggestions
      .map(s => ({
        ...s,
        score: (s.impact * 2 - s.effort) * s.confidence,
        priority: s.impact >= 8 ? 'high' : s.impact >= 6 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.score - a.score);
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

  analyzeDependencies(projectPath) {
    const deps = { packages: [], security: [] };
    
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        deps.packages = Object.keys(pkg.dependencies || {});
        
        const riskyPackages = ['lodash', 'moment', 'request'];
        deps.security = deps.packages.filter(p => riskyPackages.includes(p));
      }
    } catch (error) {
      console.log('Dependency analysis error:', error.message);
    }
    
    return deps;
  }
}

module.exports = EnhancedAnalyzer;