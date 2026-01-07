import express, { Router } from 'express';
// CONTROLEUR POSTS - LOGIQUE CRUD
const { readAll, writeAll } = require('../models/postModel');

const routeurGetAll = Router();
const routeurGetById = Router();
const routeurCreate = Router();
const routeurUpdate = Router();
const routeurRemove = Router();
// fonction simpl router()

routeurGetAll.get('/', async (req, res) => {
    const posts = await readAll();
    res.json(posts);
});

routeurGetById.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const postData = await readAll();
    const postRequest = postData.find(p => p.id === id);
    if (postRequest) {
        res.json(postRequest);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

module.exports = { getAll, getById, create, update, remove };