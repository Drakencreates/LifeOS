import api from './api';

/** Fetch all categories for the current user */
export const getCategories = () => api.get('/categories').then(r => r.data.data);

/** Create a new category */
export const createCategory = (data) => api.post('/categories', data).then(r => r.data.data);

/** Update a category */
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data.data);

/** Delete a category */
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data);

const categoryService = { getCategories, createCategory, updateCategory, deleteCategory };
export default categoryService;
