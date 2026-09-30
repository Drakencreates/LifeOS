import api from './api';

/** Fetch all goals with optional filters (status, priority, search, sort) */
export const getGoals = (params = {}) =>
  api.get('/goals', { params }).then(r => r.data.data);

/** Fetch single goal by ID */
export const getGoal = (id) =>
  api.get(`/goals/${id}`).then(r => r.data.data);

/** Create a new goal */
export const createGoal = (data) =>
  api.post('/goals', data).then(r => r.data.data);

/** Update a goal */
export const updateGoal = (id, data) =>
  api.put(`/goals/${id}`, data).then(r => r.data.data);

/** Delete a goal */
export const deleteGoal = (id) =>
  api.delete(`/goals/${id}`).then(r => r.data);

const goalService = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
};

export default goalService;
