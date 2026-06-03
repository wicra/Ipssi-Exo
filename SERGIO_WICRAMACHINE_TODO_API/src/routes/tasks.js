const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// GET /api/tasks - List all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.getAll();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Get a task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    if (!description) {
      const error = new Error('Description is required');
      error.statusCode = 400;
      return next(error);
    }
    const newTask = await Task.create({ title, description, status });
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const updatedTask = await Task.update(req.params.id, { title, description, status });
    if (!updatedTask) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Task.delete(req.params.id);
    if (!deleted) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
