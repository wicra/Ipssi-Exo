const path = require('path');
const fs = require('fs').promises;

// Set the DATA_PATH to a test file before importing Task
const TEST_DATA_PATH = path.join(__dirname, '../../data/tasks.test.json');
process.env.DATA_PATH = TEST_DATA_PATH;

const Task = require('../../src/models/task');

describe('Task Model Unit Tests', () => {
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

  test('should create a task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending'
    };

    const task = await Task.create(taskData);

    expect(task).toHaveProperty('id');
    expect(task.title).toBe(taskData.title);
    expect(task.description).toBe(taskData.description);
    expect(task.status).toBe(taskData.status);
    expect(task).toHaveProperty('createdAt');
    expect(task).toHaveProperty('updatedAt');
  });

  test('should fail to create a task without a description', async () => {
    await expect(Task.create({ title: 'No Description' }))
      .rejects
      .toThrow('Description is required');
  });

  test('should retrieve all tasks', async () => {
    await Task.create({ title: 'Task 1', description: 'Desc 1' });
    await Task.create({ title: 'Task 2', description: 'Desc 2' });

    const tasks = await Task.getAll();
    expect(tasks).toHaveLength(2);
  });

  test('should retrieve a task by ID', async () => {
    const created = await Task.create({ title: 'Find Me', description: 'Search target' });
    const found = await Task.getById(created.id);

    expect(found).not.toBeNull();
    expect(found.title).toBe('Find Me');
  });

  test('should return null for non-existent ID', async () => {
    const found = await Task.getById('non-existent-uuid');
    expect(found).toBeNull();
  });

  test('should update a task details', async () => {
    const created = await Task.create({ title: 'Old Title', description: 'Old Desc' });
    
    const updated = await Task.update(created.id, {
      title: 'New Title',
      status: 'completed'
    });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('New Title');
    expect(updated.description).toBe('Old Desc'); // Preserved
    expect(updated.status).toBe('completed');
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(updated.createdAt).getTime());
  });

  test('should delete a task successfully', async () => {
    const created = await Task.create({ title: 'Delete Me', description: 'To be deleted' });
    const deleteResult = await Task.delete(created.id);
    expect(deleteResult).toBe(true);

    const found = await Task.getById(created.id);
    expect(found).toBeNull();
  });

  test('should return false when trying to delete non-existent task', async () => {
    const deleteResult = await Task.delete('invalid-id');
    expect(deleteResult).toBe(false);
  });
});
