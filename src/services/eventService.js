import { apiFetch } from './api';

const STORAGE_KEY = 'dads_daily_events';

const initStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

export const getEvents = async () => {
  try {
    const events = await apiFetch('/api/events');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return events;
  } catch {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
};

export const saveEvent = async (event) => {
  try {
    const saved = await apiFetch(event.id ? `/api/events/${event.id}` : '/api/events', {
      method: event.id ? 'PUT' : 'POST',
      body: JSON.stringify(event),
    });
    const events = await getEvents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return saved;
  } catch {
    const events = await getEvents();
    let updated;
    if (event.id) {
      updated = events.map(e => e.id === event.id ? event : e);
    } else {
      event.id = Date.now().toString();
      updated = [...events, event];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return event;
  }
};

export const deleteEvent = async (id) => {
  try {
    await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
    const events = await getEvents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    const events = await getEvents();
    const updated = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
