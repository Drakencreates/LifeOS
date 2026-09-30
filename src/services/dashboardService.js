import api from './api';

/** Fetch aggregated dashboard analytics */
export const getDashboardStats = () =>
  api.get('/dashboard/stats').then(r => r.data.data);

const dashboardService = { getDashboardStats };
export default dashboardService;
