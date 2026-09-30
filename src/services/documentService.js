import api from './api';

/** Fetch all documents with optional filters (search, category, sort) */
export const getDocuments = (params = {}) =>
  api.get('/documents', { params }).then(r => r.data.data);

/** Fetch single document by ID */
export const getDocument = (id) =>
  api.get(`/documents/${id}`).then(r => r.data.data);

/** Upload a new document with FormData and optional onUploadProgress callback */
export const uploadDocument = (formData, onProgress) => {
  return api
    .post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    })
    .then(r => r.data.data);
};

/** Create document with JSON payload (e.g. cloud URL) */
export const createDocument = (data) =>
  api.post('/documents', data).then(r => r.data.data);

/** Delete a document */
export const deleteDocument = (id) =>
  api.delete(`/documents/${id}`).then(r => r.data);

/** Get download URL */
export const getDownloadUrl = (id) => {
  const token = localStorage.getItem('lifeos_token');
  return `http://localhost:5000/api/documents/${id}/download${token ? `?token=${token}` : ''}`;
};

const documentService = {
  getDocuments,
  getDocument,
  uploadDocument,
  createDocument,
  deleteDocument,
  getDownloadUrl
};

export default documentService;
