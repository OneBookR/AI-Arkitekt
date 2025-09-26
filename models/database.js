const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_arkitekt',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async createProject(userId, name, repoUrl = null) {
    const query = `
      INSERT INTO projects (user_id, name, repo_url)
      VALUES ($1, $2, $3)
      RETURNING id, name, repo_url, created_at
    `;
    const result = await this.pool.query(query, [userId, name, repoUrl]);
    return result.rows[0];
  }

  async createScan(projectId, uploadedFileKey = null, commitSha = null) {
    const query = `
      INSERT INTO scans (project_id, uploaded_file_s3_key, commit_sha, started_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, status, created_at
    `;
    const result = await this.pool.query(query, [projectId, uploadedFileKey, commitSha]);
    return result.rows[0];
  }

  async updateScanStatus(scanId, status, summary = null) {
    const query = `
      UPDATE scans 
      SET status = $2, summary_json = $3, finished_at = CASE WHEN $2 IN ('done', 'failed') THEN NOW() ELSE finished_at END
      WHERE id = $1
      RETURNING id, status, summary_json
    `;
    const result = await this.pool.query(query, [scanId, status, summary ? JSON.stringify(summary) : null]);
    return result.rows[0];
  }

  async getScan(scanId) {
    const query = `
      SELECT s.*, p.name as project_name, p.user_id
      FROM scans s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = $1
    `;
    const result = await this.pool.query(query, [scanId]);
    return result.rows[0];
  }

  async createFinding(scanId, finding) {
    const query = `
      INSERT INTO findings (scan_id, title, category, impact, effort, confidence, description, code_pointers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const result = await this.pool.query(query, [
      scanId,
      finding.title,
      finding.category,
      finding.impact,
      finding.effort,
      finding.confidence || 0.8,
      finding.description,
      JSON.stringify(finding.codePointers || [])
    ]);
    return result.rows[0].id;
  }

  async getFindings(scanId, filters = {}) {
    let query = `
      SELECT f.*, s.snippet_id, sn.code as snippet_code, sn.language as snippet_language
      FROM findings f
      LEFT JOIN snippets sn ON f.snippet_id = sn.id
      WHERE f.scan_id = $1
    `;
    const params = [scanId];
    let paramCount = 1;

    if (filters.category) {
      paramCount++;
      query += ` AND f.category = $${paramCount}`;
      params.push(filters.category);
    }

    if (filters.impact) {
      paramCount++;
      query += ` AND f.impact = $${paramCount}`;
      params.push(filters.impact);
    }

    query += ` ORDER BY 
      CASE f.impact WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC,
      CASE f.effort WHEN 'low' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC,
      f.confidence DESC
    `;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async createSnippet(findingId, language, code, requiredEnv = []) {
    const snippetId = uuidv4();
    const query = `
      INSERT INTO snippets (id, finding_id, language, code, required_env)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    await this.pool.query(query, [snippetId, findingId, language, code, JSON.stringify(requiredEnv)]);
    
    // Update finding with snippet_id
    await this.pool.query('UPDATE findings SET snippet_id = $1 WHERE id = $2', [snippetId, findingId]);
    
    return snippetId;
  }

  async getCatalogItems(filters = {}) {
    let query = 'SELECT * FROM catalog_items';
    const params = [];
    
    if (filters.category) {
      query += ' WHERE $1 = ANY(categories)';
      params.push(filters.category);
    }
    
    query += ' ORDER BY name';
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async logAction(userId, action, resourceType, resourceId, metadata = {}) {
    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await this.pool.query(query, [userId, action, resourceType, resourceId, JSON.stringify(metadata)]);
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = Database;