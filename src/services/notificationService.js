import { getEvents } from './eventService';
import { getMedicines } from './medicineService';
import { getWeather } from './weatherService';

const ENABLED_KEY = 'ddd-notifications-enabled';
const SENT_KEY = 'ddd-notifications-sent';
const CHECK_INTERVAL_MS = 5 * 60 * 1000;
let notificationTimer = null;

const todayKey = () => new Date().toISOString().split('T')[0];

const timeToDate = (time = '00:00') => {
  const [hours, minutes] = String(time).split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
};

const eventToDate = (event) => {
  const date = new Date(`${event.date}T${event.time || '00:00'}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatTime = (date) => date.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const readSent = () => {
  try {
    const sent = JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
    return sent.date === todayKey() ? sent.ids || [] : [];
  } catch {
    return [];
  }
};

const writeSent = (ids) => {
  localStorage.setItem(SENT_KEY, JSON.stringify({ date: todayKey(), ids }));
};

export const isNotificationSupported = () => (
  typeof window !== 'undefined'
  && 'Notification' in window
  && 'serviceWorker' in navigator
);

export const areNotificationsEnabled = () => (
  isNotificationSupported()
  && localStorage.getItem(ENABLED_KEY) === 'true'
  && Notification.permission === 'granted'
);

export const getNotificationState = () => {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (areNotificationsEnabled()) return 'enabled';
  return 'disabled';
};

export const requestAlertNotifications = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    localStorage.setItem(ENABLED_KEY, 'false');
    return permission === 'denied' ? 'blocked' : 'disabled';
  }
  localStorage.setItem(ENABLED_KEY, 'true');
  await checkAndSendAlertNotifications();
  startAlertNotifications();
  return 'enabled';
};

export const disableAlertNotifications = () => {
  localStorage.setItem(ENABLED_KEY, 'false');
  stopAlertNotifications();
  return getNotificationState();
};

const getNotificationAlerts = async () => {
  const now = new Date();
  const today = todayKey();
  const alerts = [];
  const [medicines, events, weather] = await Promise.all([
    getMedicines(),
    getEvents(),
    getWeather(),
  ]);

  medicines.forEach((medicine) => {
    const medTime = timeToDate(medicine.time);
    const minutesUntil = (medTime.getTime() - now.getTime()) / 60000;
    const label = medicine.alias || medicine.name || 'Medicine';

    if (medicine.status === 'Missed') {
      alerts.push({
        id: `medicine-missed-${medicine.id}-${today}`,
        title: 'Missed Medicine',
        body: `${label} was due at ${formatTime(medTime)}.`,
      });
      return;
    }

    if (medicine.status === 'Pending' && minutesUntil >= 0 && minutesUntil <= 30) {
      alerts.push({
        id: `medicine-due-${medicine.id}-${today}`,
        title: 'Medicine Due Soon',
        body: `${label} is due at ${formatTime(medTime)}.`,
      });
    }
  });

  events
    .filter((event) => event.reminder !== false)
    .forEach((event) => {
      const eventDate = eventToDate(event);
      if (!eventDate) return;

      const minutesUntil = (eventDate.getTime() - now.getTime()) / 60000;
      if (minutesUntil >= 0 && minutesUntil <= 60) {
        alerts.push({
          id: `event-soon-${event.id}`,
          title: 'Reminder Coming Up',
          body: `${event.title} is at ${formatTime(eventDate)}.`,
        });
      } else if (event.tag === 'Family' && minutesUntil >= 0 && minutesUntil <= 24 * 60) {
        alerts.push({
          id: `family-event-${event.id}-${today}`,
          title: 'Family Event Today',
          body: `${event.title} is coming up.`,
        });
      }
    });

  if (weather?.rainChance >= 50) {
    alerts.push({
      id: `rain-${weather.city || 'city'}-${today}`,
      title: 'Rain Alert',
      body: weather.advice || 'Carry an umbrella today.',
    });
  }

  return alerts;
};

const showNotification = async (alert) => {
  const options = {
    body: alert.body,
    icon: '/icon-192.png',
    badge: '/logo-icon.png',
    tag: alert.id,
    renotify: false,
    data: { url: '/' },
  };

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(alert.title, options);
  } catch {
    new Notification(alert.title, options);
  }
};

export const checkAndSendAlertNotifications = async () => {
  if (!areNotificationsEnabled()) return;

  const sent = readSent();
  const alerts = await getNotificationAlerts();
  const pending = alerts.filter((alert) => !sent.includes(alert.id));

  await Promise.all(pending.map(showNotification));
  if (pending.length > 0) {
    writeSent([...sent, ...pending.map((alert) => alert.id)]);
  }
};

export const startAlertNotifications = () => {
  if (!areNotificationsEnabled()) return;
  window.clearInterval(notificationTimer);
  checkAndSendAlertNotifications();
  notificationTimer = window.setInterval(checkAndSendAlertNotifications, CHECK_INTERVAL_MS);
};

export const stopAlertNotifications = () => {
  window.clearInterval(notificationTimer);
  notificationTimer = null;
};
