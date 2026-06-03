const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;

const TEST_DATA_PATH = path.join(__dirname, '../../data/tasks.integration.test.json');
process.env.DATA_PATH = TEST_DATA_PATH;

const app = require('../../src/app');
const Task = require('../../src/models/task');

describe('Todo API Integration Tests', () => {
  beforeEach(async () => {
    await Task.clear();
  });

  afterAll(async () => {
    try {
      await fs.unlink(TEST_DATA_PATH);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('GET /health', () => {
    test('should return 200 and ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a task and return 201', async () => {
      const taskData = {
        title: 'Integration Task',
        description: 'Testing via supertest',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
    });

    test('should return 400 when description is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'No Description' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Description is required');
    });
  });

  describe('GET /api/tasks', () => {
    test('should list all tasks', async () => {
      await Task.create({ title: 'T1', description: 'D1' });
      await Task.create({ title: 'T2', description: 'D2' });

      const response = await request(app).get('/api/tasks');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should return a specific task', async () => {
      const created = await Task.create({ title: 'Find Me', description: 'Target' });

      const response = await request(app).get(`/api/tasks/${created.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('Find Me');
    });

    test('should return 404 for invalid ID', async () => {
      const response = await request(app).get('/api/tasks/invalid-id');
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update task details', async () => {
      const created = await Task.create({ title: 'Before', description: 'Before' });

      const response = await request(app)
        .put(`/api/tasks/${created.id}`)
        .send({ title: 'After', status: 'in-progress' });

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('After');
      expect(response.body.status).toBe('in-progress');
    });

    test('should return 404 if updating non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent')
        .send({ title: 'Test' });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete task and return 204', async () => {
      const created = await Task.create({ title: 'To Delete', description: 'Delete' });

      const response = await request(app).delete(`/api/tasks/${created.id}`);
      expect(response.statusCode).toBe(204);

      const check = await Task.getById(created.id);
      expect(check).toBeNull();
    });

    test('should return 404 if task doesn\'t exist', async () => {
      const response = await request(app).delete('/api/tasks/invalid-id');
      expect(response.statusCode).toBe(404);
    });
  });
});
