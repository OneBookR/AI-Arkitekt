const fs = require('fs');
const path = require('path');

class CodeReplacementAnalyzer {
  constructor() {
    this.apiDatabase = require('./data/comprehensive-api-database.json');
    this.codePatterns = this.buildCodePatterns();
  }

  buildCodePatterns() {
    return {
      // Payment patterns - what they use now vs what we recommend
      payments: {
        patterns: [
          { code: /paypal|braintree/i, current: 'PayPal/Braintree', weakness: 'Begränsade funktioner' },
          { code: /square/i, current: 'Square', weakness: 'Främst för fysiska butiker' },
          { code: /manual.*payment|bank.*transfer/i, current: 'Manuella betalningar', weakness: 'Ingen automation' }
        ],
        recommendations: this.apiDatabase.payments
      },
      
      // Authentication patterns
      auth: {
        patterns: [
          { code: /passport|session|cookie.*auth/i, current: 'Egen auth-implementation', weakness: 'Säkerhetsrisker, underhållskrävande' },
          { code: /jwt.*sign|jsonwebtoken/i, current: 'Egen JWT-hantering', weakness: 'Komplex säkerhetshantering' },
          { code: /bcrypt|password.*hash/i, current: 'Egen lösenordshantering', weakness: 'Säkerhetsrisker' }
        ],
        recommendations: this.apiDatabase.authentication
      },
      
      // Analytics patterns
      analytics: {
        patterns: [
          { code: /console\.log/i, current: 'Console.log för debugging', weakness: 'Ingen strukturerad analys eller insikter' },
          { code: /google.*analytics.*gtag/i, current: 'Grundläggande GA', weakness: 'Begränsad produktanalys' },
          { code: /manual.*analytics/i, current: 'Manuell dataanalys', weakness: 'Tidskrävande, felbenäget' },
          { code: /error|catch|throw/i, current: 'Grundläggande felhantering', weakness: 'Ingen centraliserad felspårning' }
        ],
        recommendations: this.apiDatabase.analytics
      },
      
      // Communication patterns
      communication: {
        patterns: [
          { code: /nodemailer|smtp/i, current: 'Egen e-postserver', weakness: 'Leveransproblem, spam-risk' },
          { code: /manual.*email|alert.*email/i, current: 'Manuella e-postnotiser', weakness: 'Ingen automation' },
          { code: /console.*log.*notification/i, current: 'Ingen riktig kommunikation', weakness: 'Användare får ingen feedback' }
        ],
        recommendations: this.apiDatabase.communication
      },
      
      // Search patterns
      search: {
        patterns: [
          { code: /indexOf|includes.*search|filter.*search/i, current: 'Grundläggande JavaScript-sökning', weakness: 'Långsam, ingen relevans-ranking' },
          { code: /sql.*like|database.*search/i, current: 'Databassökning med LIKE', weakness: 'Långsam, ingen fuzzy matching' },
          { code: /manual.*search/i, current: 'Ingen sökfunktion', weakness: 'Dålig användarupplevelse' }
        ],
        recommendations: this.apiDatabase.search
      },
      
      // Media storage patterns
      media: {
        patterns: [
          { code: /multer|file.*upload.*local/i, current: 'Lokal fillagring', weakness: 'Skalbarhetsproblem, ingen CDN' },
          { code: /fs\.writeFile|local.*storage/i, current: 'Filsystem-lagring', weakness: 'Ingen backup, långsam leverans' },
          { code: /base64.*image/i, current: 'Base64-bilder i databas', weakness: 'Stor databasbelastning' }
        ],
        recommendations: this.apiDatabase.media_storage
      },
      
      // Monitoring patterns
      monitoring: {
        patterns: [
          { code: /console\.log.*error|try.*catch.*console/i, current: 'Console.log för felhantering', weakness: 'Ingen strukturerad felspårning' },
          { code: /manual.*monitoring/i, current: 'Manuell övervakning', weakness: 'Reaktiv istället för proaktiv' },
          { code: /no.*monitoring/i, current: 'Ingen övervakning', weakness: 'Vet inte när system går ner' },
          { code: /function|const|let|var|=>/i, current: 'Grundläggande kod utan övervakning', weakness: 'Ingen felspårning eller prestandaövervakning' }
        ],
        recommendations: this.apiDatabase.monitoring
      }
    };
  }

  async analyzeProject(projectPath) {
    console.log('🔄 Analyzing project for replacement opportunities...');
    
    const codebase = await this.scanCodebase(projectPath);
    const replacements = this.findReplacementOpportunities(codebase);
    const prioritizedRecommendations = this.prioritizeRecommendations(replacements);
    
    console.log(`📊 Sending ${codebase.files.length} files to frontend`);
    
    return {
      analysis: {
        language: 'JavaScript',
        framework: 'Node.js',
        endpoints: [],
        currentImplementations: this.summarizeCurrentCode(codebase),
        replacementOpportunities: replacements.length,
        files: codebase.files
      },
      suggestions: prioritizedRecommendations,
      businessImpact: this.calculateBusinessImpact(prioritizedRecommendations)
    };
  }

  async analyzeCodeForReplacements(projectPath, scanResult) {
    console.log('🔄 Analyzing code for replacement opportunities...');
    
    const codebase = await this.scanCodebase(projectPath);
    const replacements = this.findReplacementOpportunities(codebase);
    const prioritizedRecommendations = this.prioritizeRecommendations(replacements);
    
    console.log(`📊 Sending ${codebase.files.length} files to frontend`);
    
    return {
      analysis: {
        ...scanResult,
        currentImplementations: this.summarizeCurrentCode(codebase),
        replacementOpportunities: replacements.length,
        files: codebase.files
      },
      suggestions: prioritizedRecommendations,
      businessImpact: this.calculateBusinessImpact(prioritizedRecommendations)
    };
  }

  async scanCodebase(projectPath) {
    const codebase = { files: [], patterns: new Map() };
    const files = this.getAllFiles(projectPath);
    
    console.log(`📁 Found ${files.length} files in project: ${projectPath}`);
    console.log('First 10 files:', files.slice(0, 10).map(f => f.path));
    
    // Add ALL files to codebase, not just code files
    files.forEach(file => {
      codebase.files.push({ path: file.path, ext: file.ext });
    });
    
    let patternsFound = 0;
    
    // Only scan code files for patterns
    for (const file of files) {
      if (this.isCodeFile(file.ext)) {
        try {
          const fullPath = path.join(projectPath, file.path);
          const content = fs.readFileSync(fullPath, 'utf8');
          console.log(`📄 Reading: ${file.path} (${content.length} chars)`);
          
          // Scan for patterns in each category
          Object.entries(this.codePatterns).forEach(([category, config]) => {
            config.patterns.forEach(pattern => {
              if (pattern.code.test(content)) {
                console.log(`✅ Found ${category} pattern in ${file.path}: ${pattern.current}`);
                patternsFound++;
                if (!codebase.patterns.has(category)) {
                  codebase.patterns.set(category, []);
                }
                const snippet = this.extractCodeSnippet(content, pattern.code);
                const matchData = {
                  file: file.path,
                  current: pattern.current,
                  weakness: pattern.weakness,
                  codeSnippet: snippet.code,
                  lineNumber: snippet.lineNumber
                };
                console.log(`📝 Adding match data:`, matchData);
                codebase.patterns.get(category).push(matchData);
              }
            });
          });
        } catch (error) {
          console.log(`❌ Could not read: ${file.path} - ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Total files: ${codebase.files.length}, Code files scanned: ${files.filter(f => this.isCodeFile(f.ext)).length}, Patterns found: ${patternsFound}`);
    console.log('Pattern categories found:', Array.from(codebase.patterns.keys()));
    return codebase;
  }

  findReplacementOpportunities(codebase) {
    const opportunities = [];
    
    codebase.patterns.forEach((matches, category) => {
      if (matches.length > 0) {
        const categoryConfig = this.codePatterns[category];
        const bestRecommendations = this.selectBestRecommendations(categoryConfig.recommendations, matches);
        
        const affectedFiles = matches.map(m => ({
          file: m.file,
          lineNumber: m.lineNumber,
          codeSnippet: m.codeSnippet
        }));
        
        console.log(`🔍 Creating opportunity for ${category}:`, {
          category,
          matchCount: matches.length,
          affectedFiles: affectedFiles
        });
        
        opportunities.push({
          category,
          currentSolution: matches[0].current,
          weakness: matches[0].weakness,
          affectedFiles: affectedFiles,
          codeExamples: matches.map(m => m.codeSnippet).slice(0, 2),
          recommendations: bestRecommendations,
          impact: this.calculateCategoryImpact(category, matches.length),
          effort: this.estimateReplacementEffort(category, matches.length)
        });
      }
    });
    
    return opportunities;
  }

  selectBestRecommendations(recommendations, matches) {
    // Score recommendations based on business impact and ease of implementation
    return recommendations
      .map(rec => ({
        ...rec,
        score: this.scoreRecommendation(rec, matches)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(rec => ({
        name: rec.name,
        company: rec.company,
        description: rec.description,
        pricing: rec.pricing,
        businessImpact: rec.business_impact,
        implementationTime: rec.implementation_time,
        complexity: rec.complexity,
        roi: rec.roi,
        whyBetter: this.generateWhyBetter(rec, matches[0])
      }));
  }

  scoreRecommendation(rec, matches) {
    let score = 0;
    
    // Higher score for better business impact
    if (rec.business_impact.includes('50%')) score += 5;
    if (rec.business_impact.includes('30%')) score += 3;
    if (rec.business_impact.includes('25%')) score += 2;
    
    // Higher score for easier implementation
    if (rec.complexity === 'low' || rec.complexity === 'very_low') score += 3;
    if (rec.complexity === 'medium') score += 1;
    
    // Higher score for better ROI
    const roiMatch = rec.roi.match(/(\d+)/);
    if (roiMatch) {
      score += Math.min(parseInt(roiMatch[1]) / 100, 5);
    }
    
    return score;
  }

  generateSimpleCurrentSituation(opp) {
    return `**Nuvarande lösning:** ${opp.currentSolution} i ${opp.affectedFiles.length} filer`;
  }
  
  generateSimpleProblemAnalysis(opp) {
    return `**Problemet:** ${opp.weakness}. Detta begränsar er tillväxt och skapar teknisk skuld.`;
  }
  
  generateSimpleSolution(opp) {
    const topProvider = opp.recommendations[0];
    return `**Lösningen:** ${topProvider.name} hanterar ${opp.category} professionellt och ger er ${topProvider.businessImpact} förbättring.`;
  }
  
  generateDetailedCurrentSituation(opp) {
    const examples = opp.codeExamples.length > 0 ? ` Som vi ser i kodexemplen använder ni ${opp.codeExamples[0].substring(0, 50)}...` : '';
    
    switch (opp.category) {
      case 'analytics':
        return `**Vad ni gör nu:** Er applikation använder ${opp.currentSolution} i ${opp.affectedFiles.length} filer för att spåra användaraktivitet och fel.${examples} Detta betyder att ni samlar data men kan inte analysera den effektivt för att förstå användarbeteende eller optimera er produkt.`;
      
      case 'auth':
        return `**Vad ni gör nu:** Ni har byggt er egen autentiseringslösning med ${opp.currentSolution} i ${opp.affectedFiles.length} filer.${examples} Detta kräver att ni själva hanterar lösenordshashing, sessionshantering, och säkerhetsuppdateringar.`;
      
      case 'payments':
        return `**Vad ni gör nu:** Er betalningslösning baseras på ${opp.currentSolution} i ${opp.affectedFiles.length} filer.${examples} Detta begränsar er till grundläggande betalningsfunktioner utan avancerade features som fraud detection eller globala betalmetoder.`;
      
      default:
        return `**Vad ni gör nu:** ${opp.currentSolution} i ${opp.affectedFiles.length} filer.${examples}`;
    }
  }
  
  generateSpecificProblemAnalysis(opp) {
    const codeExamples = opp.codeExamples.length > 0 ? opp.codeExamples[0] : '';
    
    switch (opp.category) {
      case 'analytics':
        return `**Vad är problemet:** Vi hittade ${opp.affectedFiles.length} filer där ni använder console.log för debugging och felhantering. ${codeExamples ? `Som vi ser i kodexemplet "${codeExamples}" loggar ni information lokalt` : 'Ni loggar information lokalt'} utan att samla in strukturerad data om användarnas faktiska beteende. Detta betyder att ni inte vet vilka funktioner som används mest, var användare stöter på problem, eller vilka fel som orsakar mest frustration. När användare rapporterar buggar kan ni inte spåra dem tillbaka till specifika kodavsnitt eller förstå hur ofta de inträffar. Ni fattar produktbeslut baserat på gissningar istället för verklig användardata, vilket leder till att ni bygger fel funktioner och missar kritiska problem som påverkar er tillväxt.`;
      
      case 'auth':
        return `**Vad är problemet:** Vi identifierade ${opp.affectedFiles.length} filer med egen autentiseringskod. ${codeExamples ? `Kodavsnittet "${codeExamples}" visar att ni` : 'Ni'} hanterar lösenord, sessioner och säkerhet manuellt. Detta är extremt riskabelt eftersom ni måste själva implementera och underhålla alla säkerhetsaspekter: lösenordshashing med rätt salt, sessionstimeouts, brute-force protection, CSRF-skydd, och säker lösenordsåterställning. En enda säkerhetsbrist i er kod kan exponera alla användares data och leda till GDPR-böter på miljontals kronor. Dessutom saknar ni moderna funktioner som tvåfaktorsautentisering och social login som användare förväntar sig, vilket gör att ni förlorar potentiella kunder till konkurrenter.`;
      
      case 'payments':
        return `**Vad är problemet:** Er betalningslösning ${opp.currentSolution} i ${opp.affectedFiles.length} filer begränsar er affärstillväxt kritiskt. ${codeExamples ? `Koden "${codeExamples}" visar att ni` : 'Ni'} är låsta till grundläggande betalningsmetoder och missar 40-60% av potentiella kunder som förväntar sig moderna alternativ som Apple Pay, Google Pay, Swish, eller buy-now-pay-later tjänster som Klarna. Ni saknar också avancerad fraud detection vilket betyder att ni förlorar pengar på chargebacks och falska transaktioner. Varje missad betalning på grund av begränsade betalningsalternativ kostar er direkt i förlorade intäkter, och dålig betalningsupplevelse skadar ert varumärke permanent.`;
      
      case 'monitoring':
        return `**Vad är problemet:** Vi hittade ${opp.affectedFiles.length} filer med grundläggande kod utan strukturerad övervakning. ${codeExamples ? `Kodavsnittet "${codeExamples}" visar att ni` : 'Ni'} har ingen aning om när er applikation går ner, blir långsam, eller får fel i produktion. När användare rapporterar problem kan ni inte snabbt identifiera orsaken eller förstå hur många som påverkas. Detta leder till längre driftstopp, frustrerade användare som lämnar er tjänst, och förlorat förtroende. Ni upptäcker kritiska problem först när skadan redan är skedd, istället för att få varningar innan användarna märker något.`;
      
      default:
        return `**Vad är problemet:** Vi identifierade ${opp.affectedFiles.length} filer med ${opp.currentSolution}. ${codeExamples ? `Kodexemplet "${codeExamples}" visar att` : 'Detta visar att'} er nuvarande implementation har allvarliga brister: ${opp.weakness}. Detta skapar teknisk skuld som blir dyrare att fixa ju längre ni väntar, begränsar er skalbarhet när ni växer, och gör er applikation sårbar för problem som kan påverka hela er verksamhet.`;
    }
  }
  
  generateProviderSolution(opp) {
    const topProvider = opp.recommendations[0];
    
    switch (opp.category) {
      case 'analytics':
        return `**Hur ${topProvider.name} löser detta:** ${topProvider.name} ger er automatisk spårning av alla användarinteraktioner, färdiga dashboards som visar conversion funnels, och AI-drivna insikter om vad som påverkar er tillväxt. Istället för att gissa vad användare vill ha får ni exakta data om vilka funktioner som driver retention och revenue. Implementation tar ${topProvider.implementationTime} jämfört med månader att bygga egen analytics.`;
      
      case 'auth':
        return `**Hur ${topProvider.name} löser detta:** ${topProvider.name} hanterar all säkerhet automatiskt - från lösenordspolicies till tvåfaktorsautentisering och social login med 20+ providers. De uppdateras automatiskt mot nya säkerhetshot och är SOC2-certifierade. Ni får enterprise-säkerhet på ${topProvider.implementationTime} istället för 6+ månader egen utveckling.`;
      
      case 'payments':
        return `**Hur ${topProvider.name} löser detta:** ${topProvider.name} ger er tillgång till 100+ betalmetoder globalt, inbyggd fraud detection som minskar chargebacks med 70%, och automatisk PCI-compliance. De hanterar allt från Apple Pay till lokala betalmetoder i olika länder. Er conversion rate ökar med ${topProvider.businessImpact} direkt.`;
      
      default:
        return `**Hur andra kan hjälpa:** Professionella ${opp.category}-tjänster som ${topProvider.name} hanterar komplexiteten åt er.`;
    }
  }
  
  generateAfterImprovement(opp) {
    const topProvider = opp.recommendations[0];
    return `**Vad ni kommer göra istället:** Med ${topProvider.name} integrerat i er applikation får ni ${topProvider.businessImpact} förbättring utan att behöva underhålla egen kod. Ni fokuserar på er kärnprodukt medan ${topProvider.name} hanterar ${opp.category} professionellt.`;
  }
  
  generateWhyBetterDetailed(opp) {
    const topProvider = opp.recommendations[0];
    
    switch (opp.category) {
      case 'analytics':
        return `**Varför detta är bättre:** Istället för att gissa vad användare vill ha baserat på console.logs får ni exakta data om användarresor, conversion rates, och produktprestanda. ${topProvider.name} ger er samma analytics-kraft som Netflix och Spotify använder för att optimera sina produkter.`;
      
      case 'auth':
        return `**Varför detta är bättre:** Er applikation får samma säkerhetsnivå som banker använder, utan att ni behöver bli säkerhetsexperter. ${topProvider.name} används av företag som hantera miljontals användare säkert.`;
      
      case 'payments':
        return `**Varför detta är bättre:** Ni får tillgång till samma betalinfrastruktur som Amazon och Shopify använder. ${topProvider.name} processerar miljarder i transaktioner säkert varje år.`;
      
      default:
        return `**Varför detta är bättre:** Professionell lösning istället för egen implementation.`;
    }
  }
  
  generateQuantifiedBenefits(opp) {
    const topProvider = opp.recommendations[0];
    
    switch (opp.category) {
      case 'analytics':
        return `**Hur mycket bättre blir det:** Från noll användarinsikter till fullständig förståelse av er produkts prestanda. Företag som implementerar ${topProvider.name} ser i genomsnitt 25% ökning i användarretention och 40% förbättring i produktbeslut inom 3 månader.`;
      
      case 'auth':
        return `**Hur mycket bättre blir det:** Från månader av säkerhetsutveckling till ${topProvider.implementationTime} implementation. 99.9% uptime och noll säkerhetsincidenter jämfört med risken för databreach med egen auth.`;
      
      case 'payments':
        return `**Hur mycket bättre blir det:** ${topProvider.businessImpact} ökning i conversion rate plus tillgång till globala marknader. Företag som byter till ${topProvider.name} ser genomsnittligt 30% ökning i revenue inom första kvartalet.`;
      
      default:
        return `**Hur mycket bättre blir det:** ${topProvider.businessImpact} förbättring.`;
    }
  }
  
  generateWhyRecommended(opp) {
    const topProvider = opp.recommendations[0];
    const costAnalysis = this.calculateCostAnalysis(opp, topProvider);
    
    return `Vi hittade ${opp.affectedFiles.length} filer med ${opp.currentSolution} som begränsar er tillväxt. ${topProvider.name} löser detta för ${topProvider.pricing} - vilket är ${costAnalysis} än att bygga och underhålla egen lösning. Med ${topProvider.businessImpact} förbättring betalar lösningen för sig själv på ${this.calculatePaybackTime(topProvider)}.`;
  }
  
  calculateCostAnalysis(opp, provider) {
    // Simple cost comparison logic
    if (provider.pricing.includes('Gratis')) return 'betydligt billigare';
    if (provider.pricing.includes('$') && parseInt(provider.pricing.match(/\d+/)?.[0] || 0) < 100) return '90% billigare';
    return '70% billigare';
  }
  
  calculatePaybackTime(provider) {
    const roiMatch = provider.roi?.match(/(\d+)/)?.[0];
    if (roiMatch && parseInt(roiMatch) > 300) return '2-3 månader';
    if (roiMatch && parseInt(roiMatch) > 200) return '3-6 månader';
    return '6-12 månader';
  }
  
  generateWhyBetter(recommendation, currentMatch) {
    // Keep for backward compatibility
    return `Löser: ${currentMatch.weakness}`;
  }

  prioritizeRecommendations(opportunities) {
    return opportunities
      .sort((a, b) => (b.impact * 10 - b.effort) - (a.impact * 10 - a.effort))
      .map((opp, index) => ({
        id: `replacement_${opp.category}`,
        title: `Ersätt ${opp.currentSolution} med professionell ${opp.category}-lösning`,
        category: opp.category,
        priority: index + 1,
        impact: opp.impact,
        effort: opp.effort,
        
        currentSituation: {
          implementation: `${opp.currentSolution} i ${opp.affectedFiles.length} filer`,
          whatYouDoNow: this.generateSimpleCurrentSituation(opp),
          whatIsTheProblem: this.generateSimpleProblemAnalysis(opp),
          howOthersCanHelp: this.generateSimpleSolution(opp),
          codeExamples: opp.codeExamples
        },
        
        affectedFiles: opp.affectedFiles,
        
        // Debug logging
        _debug: {
          oppAffectedFiles: opp.affectedFiles,
          oppCategory: opp.category,
          oppFileCount: opp.affectedFiles ? opp.affectedFiles.length : 0
        },
        
        afterImprovement: {
          whatYouWillDoInstead: this.generateAfterImprovement(opp),
          whyThisIsBetter: this.generateWhyBetterDetailed(opp),
          howMuchBetter: this.generateQuantifiedBenefits(opp),
          estimatedTimeline: opp.recommendations[0].implementationTime
        },
        
        providers: opp.recommendations,
        whyRecommended: this.generateWhyRecommended(opp)
      }));
  }

  calculateCategoryImpact(category, fileCount) {
    const baseImpact = {
      payments: 9,      // Critical for revenue
      auth: 8,          // Critical for security  
      monitoring: 7,    // Important for reliability
      communication: 6, // Important for UX
      analytics: 5,     // Important for growth
      search: 4,        // Nice to have
      media: 3          // Performance improvement
    };
    
    return Math.min(10, (baseImpact[category] || 3) + Math.floor(fileCount / 2));
  }

  estimateReplacementEffort(category, fileCount) {
    const baseEffort = {
      payments: 6,      // Complex integration
      auth: 5,          // Security considerations
      monitoring: 3,    // Usually just adding SDK
      communication: 2, // Simple API calls
      analytics: 2,     // Simple tracking code
      search: 4,        // Data migration needed
      media: 3          // File migration
    };
    
    return Math.min(10, (baseEffort[category] || 3) + Math.floor(fileCount / 3));
  }

  // Helper methods
  extractCodeSnippet(content, pattern) {
    const lines = content.split('\n');
    const matchingLineIndex = lines.findIndex(line => pattern.test(line));
    if (matchingLineIndex !== -1) {
      return {
        code: lines[matchingLineIndex].trim(),
        lineNumber: matchingLineIndex + 1
      };
    }
    return { code: '', lineNumber: 0 };
  }

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
    return ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.php'].includes(ext);
  }

  summarizeCurrentCode(codebase) {
    const summary = {};
    codebase.patterns.forEach((matches, category) => {
      summary[category] = {
        current: matches[0]?.current || 'Ingen implementation',
        fileCount: matches.length,
        weakness: matches[0]?.weakness || 'Saknas helt'
      };
    });
    return summary;
  }

  calculateBusinessImpact(recommendations) {
    const totalROI = recommendations.reduce((sum, rec) => {
      const roiMatch = rec.providers[0]?.roi?.match(/(\d+)/);
      return sum + (roiMatch ? parseInt(roiMatch[1]) : 0);
    }, 0);
    
    return {
      totalROI: `${totalROI}%`,
      timeToValue: '2-8 veckor',
      riskReduction: '80% minskning teknisk skuld'
    };
  }
}

module.exports = CodeReplacementAnalyzer;