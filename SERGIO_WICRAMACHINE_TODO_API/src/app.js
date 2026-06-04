const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');
const { register, httpRequestsTotal, httpRequestDurationMs } = require('./monitoring');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware de métriques : intercepte chaque requête pour mesurer durée et compter
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode,
    });

    httpRequestDurationMs.observe(
      { method: req.method, route, status: res.statusCode },
      duration
    );
  });

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Endpoint /metrics pour Prometheus (scraping)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Routes
app.use('/api/tasks', taskRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
