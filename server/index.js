import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import {
  asJson,
  db,
  migrate,
  now,
  rowToDocument,
  rowToEvent,
  rowToMedicine,
  rowToSetup,
  seed,
} from './db.js';
import { newsData, weatherData } from '../src/data/mockData.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 4000;
const uploadsDir = join(__dirname, 'uploads');
const documentUploadsDir = join(uploadsDir, 'documents');
const medicineUploadsDir = join(uploadsDir, 'medicines');
const profileUploadsDir = join(uploadsDir, 'profile');

mkdirSync(documentUploadsDir, { recursive: true });
mkdirSync(medicineUploadsDir, { recursive: true });
mkdirSync(profileUploadsDir, { recursive: true });

migrate();
seed();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = documentUploadsDir;
    if (req.originalUrl.includes('/medicines')) folder = medicineUploadsDir;
    if (req.originalUrl.includes('/setup/photo')) folder = profileUploadsDir;
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const safeBase = file.originalname
      .replace(extname(file.originalname), '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    cb(null, `${Date.now()}-${safeBase || 'upload'}${extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({ storage });

const newId = () => Date.now().toString();

function getSetupRow() {
  return db.prepare('SELECT * FROM setup WHERE id = 1').get();
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time || '00:00'}`);
    const bDate = new Date(`${b.date}T${b.time || '00:00'}`);
    return aDate - bDate;
  });
}

function timeToMinutes(time = '00:00') {
  const [hours, minutes] = String(time).split(':').map((part) => Number(part));
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function markOverdueMedicinesMissed() {
  const nowDate = new Date();
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
  const pendingRows = db.prepare("SELECT id, time FROM medicines WHERE status = 'Pending'").all();
  const update = db.prepare("UPDATE medicines SET status = 'Missed', updated_at = ? WHERE id = ?");

  for (const medicine of pendingRows) {
    if (timeToMinutes(medicine.time) < nowMinutes) {
      update.run(now(), medicine.id);
    }
  }
}

function titleCase(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1).toLowerCase()}`)
    .join(' ');
}

function weatherAdvice(condition, rainChance, temp) {
  const normalized = condition.toLowerCase();
  if (rainChance >= 50 || normalized.includes('rain')) return 'Carry an umbrella today.';
  if (temp >= 34) return 'It may feel hot. Keep water nearby.';
  if (normalized.includes('cloud')) return 'Cloudy day. Good for errands.';
  return 'Good day for outdoor work. Keep a water bottle handy.';
}

async function fetchOpenWeather(city) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
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

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error('OpenWeather request failed');
  }

  const current = await currentResponse.json();
  const forecast = await forecastResponse.json();
  const nextDay = Array.isArray(forecast.list) ? forecast.list.slice(0, 8) : [];
  const temps = [
    current.main?.temp,
    current.main?.temp_max,
    current.main?.temp_min,
    ...nextDay.flatMap((item) => [item.main?.temp_max, item.main?.temp_min]),
  ].filter((value) => Number.isFinite(value));
  const rainChance = Math.round(Math.max(0, ...nextDay.map((item) => item.pop ?? 0)) * 100);
  const condition = titleCase(current.weather?.[0]?.description || current.weather?.[0]?.main || 'Clear');
  const temp = Math.round(current.main?.temp ?? weatherData.temp);

  return {
    city: current.name || city,
    temp,
    high: Math.round(Math.max(...temps)),
    low: Math.round(Math.min(...temps)),
    condition,
    rainChance,
    advice: weatherAdvice(condition, rainChance, temp),
    icon: current.weather?.[0]?.main?.includes('Rain') ? 'CloudRain' : 'CloudSun',
  };
}

const newsTopicMap = {
  Business: 'business',
  Health: 'health',
  Sports: 'sports',
  Technology: 'technology',
  Politics: 'politics',
};

function newsDateLabel(pubDate) {
  if (!pubDate) return 'Today';
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) return 'Today';
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function cleanNewsText(value = '') {
  return String(value)
    .replace(/ONLY AVAILABLE IN PAID PLANS/gi, '')
    .replace(/\[\s*\+\s*\d+\s*chars\s*\]/gi, '')
    .replace(/\s*\.\.\.\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function categoryLabel(category, fallback = 'India') {
  if (Array.isArray(category) && category.length > 0) return titleCase(category[0]);
  if (typeof category === 'string' && category) return titleCase(category);
  return fallback;
}

async function fetchNewsData(topics = []) {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return null;

  const mappedCategories = topics.map((topic) => newsTopicMap[topic]).filter(Boolean);
  const params = new URLSearchParams({
    apikey: apiKey,
    country: 'in',
    language: 'en',
    size: '10',
  });

  if (mappedCategories.length > 0) {
    params.set('category', [...new Set(mappedCategories)].join(','));
  }

  const response = await fetch(`https://newsdata.io/api/1/latest?${params}`);
  if (!response.ok) throw new Error('NewsData request failed');

  const payload = await response.json();
  if (!Array.isArray(payload.results)) return [];

  return payload.results
    .filter((item) => item.title)
    .map((item, index) => {
      const headline = cleanNewsText(item.title);
      const summary = cleanNewsText(item.description) || headline;
      const fullText = cleanNewsText(item.content) || summary;

      return {
        id: item.article_id || item.link || `${Date.now()}-${index}`,
        category: categoryLabel(item.category),
        headline,
        summary,
        fullText,
        date: newsDateLabel(item.pubDate),
        imageUrl: item.image_url,
        url: item.link,
      };
    });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/setup', (req, res) => {
  res.json(rowToSetup(getSetupRow()));
});

app.put('/api/setup', (req, res) => {
  const existing = rowToSetup(getSetupRow()) ?? {};
  const setup = {
    dadName: req.body.dadName ?? req.body.dad_name ?? existing.dadName ?? 'Dad',
    sonName: req.body.sonName ?? req.body.son_name ?? existing.sonName ?? '',
    sonPhone: req.body.sonPhone ?? req.body.son_phone ?? existing.sonPhone ?? '',
    sonRelation: req.body.sonRelation ?? existing.sonRelation ?? 'Son',
    city: req.body.city ?? existing.city ?? 'Pune',
    language: req.body.language ?? existing.language ?? 'English',
    theme: req.body.theme ?? existing.theme ?? 'light',
    newsTopics: req.body.newsTopics ?? existing.newsTopics ?? [],
  };

  db.prepare(`
    INSERT INTO setup (
      id, dad_name, son_name, son_phone, son_relation, city, language, theme,
      news_topics_json, created_at, updated_at
    )
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      dad_name = excluded.dad_name,
      son_name = excluded.son_name,
      son_phone = excluded.son_phone,
      son_relation = excluded.son_relation,
      city = excluded.city,
      language = excluded.language,
      theme = excluded.theme,
      news_topics_json = excluded.news_topics_json,
      updated_at = excluded.updated_at
  `).run(
    setup.dadName,
    setup.sonName,
    setup.sonPhone,
    setup.sonRelation,
    setup.city,
    setup.language,
    setup.theme,
    asJson(setup.newsTopics),
    now(),
    now(),
  );

  res.json(rowToSetup(getSetupRow()));
});

app.post('/api/setup/photo', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Profile photo is required' });

  const photoPath = `/uploads/profile/${req.file.filename}`;
  db.prepare('UPDATE setup SET profile_photo_path = ?, updated_at = ? WHERE id = 1')
    .run(photoPath, now());

  res.json(rowToSetup(getSetupRow()));
});

app.get('/api/weather', async (req, res) => {
  const setup = rowToSetup(getSetupRow());
  const city = req.query.city || setup?.city || weatherData.city;
  try {
    const liveWeather = await fetchOpenWeather(city);
    res.json(liveWeather || { ...weatherData, city });
  } catch (error) {
    console.warn(error.message);
    res.json({ ...weatherData, city });
  }
});

app.get('/api/news', async (req, res) => {
  const setup = rowToSetup(getSetupRow());
  const topics = setup?.newsTopics ?? [];
  try {
    const liveNews = await fetchNewsData(topics);
    if (liveNews?.length) {
      res.json(liveNews);
      return;
    }
  } catch (error) {
    console.warn(error.message);
  }

  const filtered = topics.length ? newsData.filter((item) => topics.includes(item.category)) : newsData;
  res.json(filtered.length ? filtered : newsData);
});

app.get('/api/medicines', (req, res) => {
  markOverdueMedicinesMissed();
  const rows = db.prepare('SELECT * FROM medicines ORDER BY time ASC, name ASC').all();
  res.json(rows.map(rowToMedicine));
});

app.post('/api/medicines', upload.single('image'), (req, res) => {
  const body = req.body;
  const timestamp = now();
  const imagePath = req.file ? `/uploads/medicines/${req.file.filename}` : body.imageUrl || null;
  const medicine = {
    id: body.id || newId(),
    name: body.name,
    alias: body.alias || '',
    description: body.description || '',
    time: body.time || '09:00',
    category: body.category || body.type || 'Other',
    imagePath,
    status: body.status || 'Pending',
  };

  db.prepare(`
    INSERT INTO medicines (
      id, name, alias, description, time, category, image_path, status,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    medicine.id,
    medicine.name,
    medicine.alias,
    medicine.description,
    medicine.time,
    medicine.category,
    medicine.imagePath,
    medicine.status,
    timestamp,
    timestamp,
  );

  res.status(201).json(rowToMedicine(db.prepare('SELECT * FROM medicines WHERE id = ?').get(medicine.id)));
});

app.put('/api/medicines/:id', upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Medicine not found' });

  const body = req.body;
  const imagePath = req.file
    ? `/uploads/medicines/${req.file.filename}`
    : body.imageUrl ?? existing.image_path;

  db.prepare(`
    UPDATE medicines SET
      name = ?, alias = ?, description = ?, time = ?, category = ?,
      image_path = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(
    body.name ?? existing.name,
    body.alias ?? existing.alias,
    body.description ?? existing.description,
    body.time ?? existing.time,
    body.category ?? body.type ?? existing.category,
    imagePath,
    body.status ?? existing.status,
    now(),
    req.params.id,
  );

  res.json(rowToMedicine(db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id)));
});

app.patch('/api/medicines/:id/status', (req, res) => {
  const existing = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Medicine not found' });
  const nextStatus = req.body.status || (existing.status === 'Taken' ? 'Pending' : 'Taken');
  db.prepare('UPDATE medicines SET status = ?, updated_at = ? WHERE id = ?')
    .run(nextStatus, now(), req.params.id);
  res.json(rowToMedicine(db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id)));
});

app.delete('/api/medicines/:id', (req, res) => {
  db.prepare('DELETE FROM medicines WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

app.get('/api/events', (req, res) => {
  const rows = db.prepare('SELECT * FROM events').all();
  res.json(sortEvents(rows.map(rowToEvent)));
});

app.post('/api/events', (req, res) => {
  const timestamp = now();
  const event = {
    id: req.body.id || newId(),
    title: req.body.title,
    date: req.body.date,
    time: req.body.time || '09:00',
    notes: req.body.notes || '',
    tag: req.body.tag || 'Other',
    reminder: Boolean(req.body.reminder),
  };

  db.prepare(`
    INSERT INTO events (
      id, title, date, time, notes, tag, reminder_enabled, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.id,
    event.title,
    event.date,
    event.time,
    event.notes,
    event.tag,
    event.reminder ? 1 : 0,
    timestamp,
    timestamp,
  );

  res.status(201).json(rowToEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(event.id)));
});

app.put('/api/events/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  db.prepare(`
    UPDATE events SET
      title = ?, date = ?, time = ?, notes = ?, tag = ?, reminder_enabled = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    req.body.title ?? existing.title,
    req.body.date ?? existing.date,
    req.body.time ?? existing.time,
    req.body.notes ?? existing.notes,
    req.body.tag ?? existing.tag,
    req.body.reminder === undefined ? existing.reminder_enabled : Number(Boolean(req.body.reminder)),
    now(),
    req.params.id,
  );

  res.json(rowToEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)));
});

app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

app.get('/api/documents', (req, res) => {
  const query = String(req.query.search || '').trim().toLowerCase();
  const docs = db.prepare('SELECT * FROM documents ORDER BY upload_date DESC, name ASC').all().map(rowToDocument);
  if (!query) return res.json(docs);

  res.json(docs.filter((doc) => {
    const haystack = [
      doc.name,
      doc.category,
      doc.description,
      doc.type,
      ...(doc.tags || []),
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  }));
});

app.post('/api/documents', upload.single('file'), (req, res) => {
  const timestamp = now();
  const fileType = (req.body.type || req.file?.mimetype?.split('/').pop() || 'file').toLowerCase();
  const doc = {
    id: req.body.id || newId(),
    name: req.body.name || req.file?.originalname || 'Document',
    category: req.body.category || 'Other',
    tags: Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    description: req.body.description || '',
    fileType,
    filePath: req.file ? `/uploads/documents/${req.file.filename}` : req.body.url || null,
    uploadDate: req.body.uploadDate || new Date().toISOString().split('T')[0],
  };

  db.prepare(`
    INSERT INTO documents (
      id, name, category, tags_json, description, file_type, file_path,
      upload_date, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    doc.id,
    doc.name,
    doc.category,
    asJson(doc.tags),
    doc.description,
    doc.fileType,
    doc.filePath,
    doc.uploadDate,
    timestamp,
    timestamp,
  );

  res.status(201).json(rowToDocument(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)));
});

app.put('/api/documents/:id', upload.single('file'), (req, res) => {
  const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Document not found' });

  const tags = req.body.tags === undefined
    ? JSON.parse(existing.tags_json || '[]')
    : String(req.body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  const filePath = req.file ? `/uploads/documents/${req.file.filename}` : req.body.url ?? existing.file_path;
  const fileType = (req.body.type || req.file?.mimetype?.split('/').pop() || existing.file_type).toLowerCase();

  db.prepare(`
    UPDATE documents SET
      name = ?, category = ?, tags_json = ?, description = ?, file_type = ?,
      file_path = ?, updated_at = ?
    WHERE id = ?
  `).run(
    req.body.name ?? existing.name,
    req.body.category ?? existing.category,
    asJson(tags),
    req.body.description ?? existing.description,
    fileType,
    filePath,
    now(),
    req.params.id,
  );

  res.json(rowToDocument(db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id)));
});

app.delete('/api/documents/:id', (req, res) => {
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

app.get('/api/alerts', (req, res) => {
  markOverdueMedicinesMissed();
  const today = new Date().toISOString().split('T')[0];
  const meds = db.prepare('SELECT * FROM medicines ORDER BY time ASC').all().map(rowToMedicine);
  const events = sortEvents(db.prepare('SELECT * FROM events').all().map(rowToEvent))
    .filter((event) => event.date >= today);

  const alerts = [];
  const missed = meds.find((med) => med.status === 'Missed');
  const pending = meds.find((med) => med.status === 'Pending');
  const familyEvent = events.find((event) => event.tag === 'Family');

  if (missed) {
    alerts.push({
      id: `missed-${missed.id}`,
      title: 'Missed Medicine',
      message: `${missed.alias || missed.name} was missed`,
      type: 'alert',
      icon: 'Pill',
    });
  }

  if (pending) {
    alerts.push({
      id: `medicine-${pending.id}`,
      title: 'Medicine Due',
      message: `${pending.alias || pending.name} due at ${pending.time}`,
      type: 'warning',
      icon: 'Pill',
    });
  }

  if (weatherData.rainChance > 20) {
    alerts.push({
      id: 'weather-rain',
      title: 'Weather Alert',
      message: 'Rain expected today',
      type: 'info',
      icon: 'CloudRain',
    });
  }

  if (familyEvent) {
    alerts.push({
      id: `family-${familyEvent.id}`,
      title: 'Family Reminder',
      message: `${familyEvent.title} on ${familyEvent.date}`,
      type: 'info',
      icon: 'Bell',
    });
  }

  res.json(alerts);
});

app.use((err, req, res, next) => {
  void next;
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`Dad's Daily Driver API running on http://localhost:${port}`);
});
