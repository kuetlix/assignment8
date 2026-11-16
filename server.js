import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ----------------------------------------------------------------------------
// Setup
// ----------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

// ----------------------------------------------------------------------------
// Hard coded data
// ----------------------------------------------------------------------------
const OWNER_NAME = 'Kübra ETLİ';

const ROBOTS_TXT = [
  'User-agent: *',
  'Disallow: /api/admin',
  'Allow: /',
].join('\n');

// ----------------------------------------------------------------------------
// Text routes
// ----------------------------------------------------------------------------
app.get('/hello', (req, res) => {
  res.type('text/plain').send(`Hello from ${OWNER_NAME}'s server`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(ROBOTS_TXT);
});

const COURSES = Object.freeze([
  Object.freeze({ id: 1, title: 'Introduction to Programming', credits: 6 }),
  Object.freeze({ id: 2, title: 'Web Programming', credits: 5 }),
  Object.freeze({ id: 3, title: 'Databases', credits: 5 }),
  Object.freeze({ id: 4, title: 'Computer Networks', credits: 4 }),
]);

app.get('/old-page', (req, res) => {
  res.redirect(301, '/hello');
});

// ----------------------------------------------------------------------------
// API routes (JSON)
// ----------------------------------------------------------------------------
app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    userAgent: req.get('User-Agent') ?? null,
    accept: req.get('Accept') ?? null,
  });
});

app.post('/api/subscribe', (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

// ----------------------------------------------------------------------------
// 404 fallback:registered LAST so it never hides a real route.
// app.use without a path matches every method and every path (Express 5 safe).
// ----------------------------------------------------------------------------
app.use((req, res) => {
  const isApiPath = req.path === '/api' || req.path.startsWith('/api/');

  if (isApiPath) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).type('text/plain').send(`Page not found: ${req.path}`);
  }
});

// ----------------------------------------------------------------------------
// Start
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});