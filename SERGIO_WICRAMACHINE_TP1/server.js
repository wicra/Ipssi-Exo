// IMPORTE
import express from 'express';

const express = require('express');
const postsRouter = require('./routes/posts');
const logger = require('./middlewares/logger');
const app = express();
app.use(express.json());
app.use(logger);
app.use('/posts', postsRouter);


app.listen(3000, ()=> console.log('Listening 3000'));