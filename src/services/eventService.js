import api from './api';

/**
 * Fetch all events for the current user.
 * @param {object} params - Optional filters: search, categoryId, importance, sort
 */
export const getEvents = (params = {}) =>
  api.get('/events', { params }).then(r => r.data.data);

/** Fetch a single event by ID */
export const getEvent = (id) => api.get(`/events/${id}`).then(r => r.data.data);

/** Create a new event */
export const createEvent = (data) => api.post('/events', data).then(r => r.data.data);

/** Update an event */
export const updateEvent = (id, data) => api.put(`/events/${id}`, data).then(r => r.data.data);

/** Delete an event */
export const deleteEvent = (id) => api.delete(`/events/${id}`).then(r => r.data);

const eventService = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
export default eventService;
