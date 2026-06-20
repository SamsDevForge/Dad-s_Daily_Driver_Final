import { apiFetch } from './api';

const SETUP_KEY = 'ddd-setup';

export const getSetup = () => {
  try {
    const raw = localStorage.getItem(SETUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const fetchSetup = async () => {
  try {
    const setup = await apiFetch('/api/setup');
    if (setup) {
      localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
    }
    return setup;
  } catch {
    return getSetup();
  }
};

export const saveSetup = async (data) => {
  localStorage.setItem(SETUP_KEY, JSON.stringify(data));
  try {
    const saved = await apiFetch('/api/setup', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    localStorage.setItem(SETUP_KEY, JSON.stringify(saved));
    return saved;
  } catch {
    return data;
  }
};

export const uploadProfilePhoto = async (file) => {
  const payload = new FormData();
  payload.append('photo', file);

  try {
    const saved = await apiFetch('/api/setup/photo', {
      method: 'POST',
      body: payload,
    });
    localStorage.setItem(SETUP_KEY, JSON.stringify(saved));
    return saved;
  } catch {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const setup = { ...(getSetup() || {}), profilePhotoUrl: dataUrl };
    localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
    return setup;
  }
};

export const isSetupComplete = () => {
  const s = getSetup();
  return s && s.sonPhone && s.city;
};
