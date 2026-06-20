import { apiFetch } from './api';

const STORAGE_KEY = 'dads_daily_events';

const createEventId = () => (
  crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

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
    const nextEvent = { ...event };
    let updated;
    if (nextEvent.id) {
      updated = events.map(e => e.id === nextEvent.id ? nextEvent : e);
    } else {
      nextEvent.id = createEventId();
      updated = [...events, nextEvent];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return nextEvent;
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
