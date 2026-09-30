import api from './api';

/** Fetch all memories with optional filters (search, sort) */
export const getMemories = (params = {}) =>
  api.get('/memories', { params }).then(r => r.data.data);

/** Fetch single memory by ID */
export const getMemory = (id) =>
  api.get(`/memories/${id}`).then(r => r.data.data);

/** Create a new memory */
export const createMemory = (data) =>
  api.post('/memories', data).then(r => r.data.data);

/** Update a memory */
export const updateMemory = (id, data) =>
  api.put(`/memories/${id}`, data).then(r => r.data.data);

/** Delete a memory */
export const deleteMemory = (id) =>
  api.delete(`/memories/${id}`).then(r => r.data);

const memoryService = {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory
};

export default memoryService;
