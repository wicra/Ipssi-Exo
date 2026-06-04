const client = require('prom-client');

// Collecte automatique des métriques système (CPU, mémoire, event loop...)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Compteur custom : nombre total de requêtes HTTP par méthode, route et statut
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Histogramme : durée des requêtes HTTP (pour calculer la latence p95)
const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Durée des requêtes HTTP en millisecondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

module.exports = { register, httpRequestsTotal, httpRequestDurationMs };
