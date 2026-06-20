import { weatherData } from '../data/mockData';
import { apiFetch } from './api';
import { getSetup } from './setupService';

const titleCase = (value = '') => value
  .split(' ')
  .filter(Boolean)
  .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1).toLowerCase()}`)
  .join(' ');

const adviceForWeather = (condition, rainChance, temp) => {
  const normalized = condition.toLowerCase();
  if (rainChance >= 50 || normalized.includes('rain')) return 'Carry an umbrella today.';
  if (temp >= 34) return 'It may feel hot. Keep water nearby.';
  if (normalized.includes('cloud')) return 'Cloudy day. Good for errands.';
  return 'Good day for outdoor work. Keep a water bottle handy.';
};

const getClientWeather = async (city = 'Pune') => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    q: city,
    appid: apiKey,
    units: 'metric',
  });

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) return null;

  const current = await currentResponse.json();
  const forecast = await forecastResponse.json();
  const nextDay = Array.isArray(forecast.list) ? forecast.list.slice(0, 8) : [];
  const temps = [
    current.main?.temp,
    current.main?.temp_max,
    current.main?.temp_min,
    ...nextDay.flatMap((item) => [item.main?.temp_max, item.main?.temp_min]),
  ].filter((value) => Number.isFinite(value));
  const condition = titleCase(current.weather?.[0]?.description || current.weather?.[0]?.main || 'Clear');
  const rainChance = Math.round(Math.max(0, ...nextDay.map((item) => item.pop ?? 0)) * 100);
  const temp = Math.round(current.main?.temp ?? weatherData.temp);

  return {
    city: current.name || city,
    temp,
    high: Math.round(Math.max(...temps)),
    low: Math.round(Math.min(...temps)),
    condition,
    rainChance,
    advice: adviceForWeather(condition, rainChance, temp),
    icon: current.weather?.[0]?.main?.includes('Rain') ? 'CloudRain' : 'CloudSun',
  };
};

export const getWeather = async (city) => {
  const preferredCity = city || getSetup()?.city || 'Pune';
  try {
    const query = `?city=${encodeURIComponent(preferredCity)}`;
    return await apiFetch(`/api/weather${query}`);
  } catch {
    return await getClientWeather(preferredCity) || { ...weatherData, city: preferredCity };
  }
};
