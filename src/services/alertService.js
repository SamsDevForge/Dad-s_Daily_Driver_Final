import { apiFetch } from './api';

export const getAlerts = async () => {
  try {
    return await apiFetch('/api/alerts');
  } catch {
    return [];
  }
};
