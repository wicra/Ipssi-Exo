// IMPORTS
const express = require('express');
const logger = require('./middlewares/logger');
const postRoutes = require('./routes/posts');

// APP
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(logger);

// ROUTES
app.use('/posts', postRoutes);

// DÉMARRAGE SERVEUR
app.listen(3000, () => console.log('Server listening on port 3000'));