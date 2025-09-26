-- Seed data for AI-Arkitekt

-- Insert sample catalog items
INSERT INTO catalog_items (name, categories, tags, quick_pitch, integration_guide, pricing_meta) VALUES
(
  'OpenAI GPT-4',
  ARRAY['ai', 'chatbot', 'content'],
  ARRAY['nlp', 'conversation', 'text-generation'],
  'Avancerad språkmodell för chatbots och innehållsgenerering',
  '# OpenAI Integration\n\n1. Installera: `npm install openai`\n2. Konfigurera API-nyckel\n3. Implementera chat-endpoint',
  '{"pricing": "Från $0.03/1K tokens", "freeTier": false, "payAsYouGo": true}'
),
(
  'Stripe Payments',
  ARRAY['payment', 'ecommerce'],
  ARRAY['checkout', 'subscription', 'billing'],
  'Komplett betalningsplattform för online-handel',
  '# Stripe Integration\n\n1. Skapa Stripe-konto\n2. Installera: `npm install stripe`\n3. Konfigurera webhooks',
  '{"pricing": "2.9% + 30¢ per transaktion", "freeTier": true, "payAsYouGo": true}'
),
(
  'Algolia Search',
  ARRAY['search', 'ux'],
  ARRAY['instant-search', 'autocomplete', 'faceting'],
  'Snabb och relevant sökning för webbappar',
  '# Algolia Integration\n\n1. Skapa index\n2. Installera: `npm install algoliasearch`\n3. Implementera sökgränssnitt',
  '{"pricing": "Från $500/månad", "freeTier": true, "payAsYouGo": false}'
),
(
  'SendGrid Email',
  ARRAY['email', 'marketing'],
  ARRAY['transactional', 'newsletter', 'automation'],
  'E-postleverans och marknadsföringsautomation',
  '# SendGrid Integration\n\n1. Verifiera domän\n2. Installera: `npm install @sendgrid/mail`\n3. Konfigurera templates',
  '{"pricing": "Gratis upp till 100 e-post/dag", "freeTier": true, "payAsYouGo": true}'
),
(
  'DataDog Monitoring',
  ARRAY['monitoring', 'devops'],
  ARRAY['apm', 'logs', 'metrics', 'alerts'],
  'Fullständig observability för applikationer',
  '# DataDog Integration\n\n1. Installera agent\n2. Konfigurera dashboards\n3. Sätt upp alerts',
  '{"pricing": "Från $15/host/månad", "freeTier": true, "payAsYouGo": false}'
),
(
  'Cloudinary Images',
  ARRAY['media', 'cdn'],
  ARRAY['image-optimization', 'video', 'transformation'],
  'Bildhantering och optimering i molnet',
  '# Cloudinary Integration\n\n1. Skapa konto\n2. Installera: `npm install cloudinary`\n3. Konfigurera upload-widget',
  '{"pricing": "Gratis upp till 25GB", "freeTier": true, "payAsYouGo": true}'
);

-- Insert sample user (for testing)
INSERT INTO users (id, email, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'user');

-- Insert sample project
INSERT INTO projects (id, user_id, name, repo_url) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Demo Project', 'https://github.com/user/demo-project');

-- Insert sample scan
INSERT INTO scans (id, project_id, status, summary_json) VALUES
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'done', 
'{"findingsCount": 5, "topSuggestion": "Add AI chatbot", "estimatedImpact": "high", "language": "JavaScript", "framework": "Express"}');

-- Insert sample findings
INSERT INTO findings (scan_id, title, category, impact, effort, confidence, description) VALUES
('770e8400-e29b-41d4-a716-446655440002', 'Lägg till AI-chatbot för kundsupport', 'ux', 'high', 'low', 0.9, 'Implementera en intelligent chatbot för att förbättra kundupplevelsen och minska supportbelastningen.'),
('770e8400-e29b-41d4-a716-446655440002', 'Implementera betalningssystem', 'business', 'high', 'medium', 0.8, 'Integrera Stripe för säkra online-betalningar och prenumerationer.'),
('770e8400-e29b-41d4-a716-446655440002', 'Förbättra sökfunktionalitet', 'ux', 'medium', 'medium', 0.7, 'Uppgradera till Algolia för snabbare och mer relevant sökning.'),
('770e8400-e29b-41d4-a716-446655440002', 'Lägg till systemmonitorering', 'devops', 'high', 'low', 0.9, 'Implementera DataDog för real-time övervakning och alerting.'),
('770e8400-e29b-41d4-a716-446655440002', 'Optimera bildhantering', 'performance', 'medium', 'low', 0.8, 'Använd Cloudinary för automatisk bildoptimering och CDN-leverans.');