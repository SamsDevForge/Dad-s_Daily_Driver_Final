import { newsData } from '../data/mockData';
import { apiFetch } from './api';

const cleanNewsText = (value = '') => String(value)
  .replace(/ONLY AVAILABLE IN PAID PLANS/gi, '')
  .replace(/\[\s*\+\s*\d+\s*chars\s*\]/gi, '')
  .replace(/\s*\.\.\.\s*$/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const titleCase = (value = '') => value
  .split(' ')
  .filter(Boolean)
  .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1).toLowerCase()}`)
  .join(' ');

const dateLabel = (pubDate) => {
  if (!pubDate) return 'Today';
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) return 'Today';
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getClientNews = async () => {
  const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    apikey: apiKey,
    country: 'in',
    language: 'en',
    size: '10',
  });
  const response = await fetch(`https://newsdata.io/api/1/latest?${params}`);
  if (!response.ok) return null;

  const payload = await response.json();
  if (!Array.isArray(payload.results)) return null;

  return payload.results
    .filter((item) => item.title)
    .map((item, index) => {
      const headline = cleanNewsText(item.title);
      const summary = cleanNewsText(item.description) || headline;
      const fullText = cleanNewsText(item.content) || summary;
      const category = Array.isArray(item.category) && item.category.length
        ? titleCase(item.category[0])
        : 'India';

      return {
        id: item.article_id || item.link || `${Date.now()}-${index}`,
        category,
        headline,
        summary,
        fullText,
        date: dateLabel(item.pubDate),
        imageUrl: item.image_url,
        url: item.link,
      };
    });
};

export const getNews = async () => {
  try {
    return await apiFetch('/api/news');
  } catch {
    return await getClientNews() || newsData;
  }
};
