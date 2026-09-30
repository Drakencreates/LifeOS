import api from './api';

/** Execute global search query across all entities */
export const globalSearch = (q) =>
  api.get('/search', { params: { q } }).then(r => r.data.data);

const searchService = { globalSearch };
export default searchService;
