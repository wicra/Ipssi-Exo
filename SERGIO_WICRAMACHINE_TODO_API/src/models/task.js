const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../data/tasks.json');

async function ensureDirectoryExists() {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readTasks() {
  try {
    await ensureDirectoryExists();
    const data = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeTasks(tasks) {
  await ensureDirectoryExists();
  await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), 'utf8');
}

class Task {
  static async getAll() {
    return await readTasks();
  }

  static async getById(id) {
    const tasks = await readTasks();
    return tasks.find(t => t.id === id) || null;
  }

  static async create({ title, description, status = 'pending' }) {
    if (!description) {
      throw new Error('Description is required');
    }

    const tasks = await readTasks();
    const now = new Date().toISOString();

    const newTask = {
      id: uuidv4(),
      title: title || '',
      description,
      status,
      createdAt: now,
      updatedAt: now
    };

    tasks.push(newTask);
    await writeTasks(tasks);
    return newTask;
  }

  static async update(id, { title, description, status }) {
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return null;
    }

    const now = new Date().toISOString();
    const existingTask = tasks[taskIndex];

    const updatedTask = {
      ...existingTask,
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      status: status !== undefined ? status : existingTask.status,
      updatedAt: now
    };

    tasks[taskIndex] = updatedTask;
    await writeTasks(tasks);
    return updatedTask;
  }

  static async delete(id) {
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return false;
    }

    tasks.splice(taskIndex, 1);
    await writeTasks(tasks);
    return true;
  }

  static async clear() {
    await writeTasks([]);
  }
}

module.exports = Task;
