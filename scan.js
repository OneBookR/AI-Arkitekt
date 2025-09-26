const fs = require('fs');
const path = require('path');

function detectLanguage(files) {
  const extCount = {};
  files.forEach(f => {
    const ext = path.extname(f).toLowerCase();
    extCount[ext] = (extCount[ext] || 0) + 1;
  });
  if (extCount['.js']) return 'JavaScript';
  if (extCount['.py']) return 'Python';
  if (extCount['.ts']) return 'TypeScript';
  return 'Unknown';
}

function detectFramework(files) {
  if (files.includes('package.json')) return 'Node.js/Express';
  if (files.includes('requirements.txt')) return 'Python/Flask/Django';
  return 'Unknown';
}

function scanEndpoints(dir) {
  // Enkel heuristik: leta efter express routes i JS-filer
  const endpoints = [];
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    if (f.endsWith('.js')) {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      const matches = content.match(/app\.(get|post|put|delete)\(['"](.*?)['"]/g);
      if (matches) {
        matches.forEach(m => {
          const route = m.match(/app\.(get|post|put|delete)\(['"](.*?)['"]/);
          if (route) endpoints.push({ method: route[1], path: route[2] });
        });
      }
    }
  });
  return endpoints;
}

function scanAuthFlows(dir) {
  // Enkel heuristik: leta efter "passport", "jwt", "auth" i kod
  const files = fs.readdirSync(dir);
  let auth = [];
  files.forEach(f => {
    if (f.endsWith('.js')) {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      if (content.includes('passport') || content.includes('jwt') || content.includes('auth')) {
        auth.push(f);
      }
    }
  });
  return auth;
}

module.exports = async function scanProject(projectPath) {
  const files = fs.readdirSync(projectPath);
  const language = detectLanguage(files);
  const framework = detectFramework(files);
  const endpoints = scanEndpoints(projectPath);
  const authFlows = scanAuthFlows(projectPath);
  return {
    language,
    framework,
    endpoints,
    authFlows
  };
};