const https = require('https');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

class GitHubIntegration {
  constructor() {
    this.apiBase = 'https://api.github.com';
  }

  async downloadRepository(repoUrl) {
    // Extrahera owner/repo från URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Ogiltig GitHub URL');
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace('.git', '');
    
    // Ladda ner som ZIP
    const downloadUrl = `https://github.com/${owner}/${cleanRepo}/archive/refs/heads/main.zip`;
    
    return new Promise((resolve, reject) => {
      const zipPath = path.join(__dirname, 'uploads', `${owner}-${cleanRepo}-${Date.now()}.zip`);
      const file = fs.createWriteStream(zipPath);
      
      https.get(downloadUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Följ redirect
          https.get(response.headers.location, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(zipPath);
            });
          }).on('error', reject);
        } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(zipPath);
          });
        }
      }).on('error', reject);
    });
  }

  async extractRepository(zipPath) {
    const zip = new AdmZip(zipPath);
    const extractPath = path.join(__dirname, 'uploads', `extracted-${Date.now()}`);
    
    fs.mkdirSync(extractPath, { recursive: true });
    zip.extractAllTo(extractPath, true);
    
    // Hitta den extraherade mappen (GitHub lägger till -main suffix)
    const contents = fs.readdirSync(extractPath);
    const projectDir = contents.find(item => 
      fs.statSync(path.join(extractPath, item)).isDirectory()
    );
    
    if (projectDir) {
      return path.join(extractPath, projectDir);
    }
    
    return extractPath;
  }

  async getRepositoryInfo(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const cleanRepo = repo.replace('.git', '');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${cleanRepo}`,
        headers: {
          'User-Agent': 'AI-Arkitekt'
        }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const repoInfo = JSON.parse(data);
            resolve({
              name: repoInfo.name,
              description: repoInfo.description,
              language: repoInfo.language,
              stars: repoInfo.stargazers_count,
              forks: repoInfo.forks_count,
              size: repoInfo.size,
              topics: repoInfo.topics || []
            });
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  async analyzeFromGitHub(repoUrl) {
    try {
      // Hämta repo-info
      const repoInfo = await this.getRepositoryInfo(repoUrl);
      
      // Ladda ner och extrahera
      const zipPath = await this.downloadRepository(repoUrl);
      const projectPath = await this.extractRepository(zipPath);
      
      // Rensa upp ZIP-filen
      fs.unlinkSync(zipPath);
      
      return {
        projectPath,
        repoInfo
      };
    } catch (error) {
      throw new Error(`GitHub-integration misslyckades: ${error.message}`);
    }
  }
}

module.exports = GitHubIntegration;