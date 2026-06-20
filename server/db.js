import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  initialEvents,
} from '../src/data/mockData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, 'dads-daily-driver.sqlite'));
db.exec('PRAGMA foreign_keys = ON');

const now = () => new Date().toISOString();
const asJson = (value) => JSON.stringify(value ?? []);

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS setup (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      dad_name TEXT DEFAULT 'Dad',
      son_name TEXT,
      son_phone TEXT,
      son_relation TEXT DEFAULT 'Son',
      city TEXT NOT NULL DEFAULT 'Pune',
      language TEXT NOT NULL DEFAULT 'English',
      theme TEXT NOT NULL DEFAULT 'light',
      news_topics_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      alias TEXT,
      description TEXT,
      time TEXT NOT NULL,
      category TEXT NOT NULL,
      image_path TEXT,
      status TEXT NOT NULL CHECK (status IN ('Taken', 'Pending', 'Missed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      tag TEXT NOT NULL,
      reminder_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      file_type TEXT,
      file_path TEXT,
      upload_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  ensureColumn('setup', 'profile_photo_path', 'TEXT');
}

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function tableIsEmpty(table) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count === 0;
}

export function seed() {
  if (tableIsEmpty('setup')) {
    const timestamp = now();
    db.prepare(`
      INSERT INTO setup (
        id, dad_name, son_name, son_phone, son_relation, city, language, theme,
        news_topics_json, created_at, updated_at
      )
      VALUES (1, 'Dad', '', '', 'Son', 'Pune', 'English', 'light', ?, ?, ?)
    `).run(asJson(['India', 'Health']), timestamp, timestamp);
  }

  if (tableIsEmpty('events')) {
    const insert = db.prepare(`
      INSERT INTO events (
        id, title, date, time, notes, tag, reminder_enabled, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = now();
    for (const event of initialEvents) {
      insert.run(
        event.id,
        event.title,
        event.date,
        event.time,
        event.notes ?? '',
        event.tag ?? 'Other',
        event.reminder ? 1 : 0,
        timestamp,
        timestamp,
      );
    }
  }

  cleanupDefaultRows();
}

function cleanupDefaultRows() {
  const defaultMedicineNames = [
    'Metformin 500mg',
    'Telmisartan 40mg',
    'Aspirin 75mg',
  ];
  const defaultDocumentNames = [
    'Aadhaar Card',
    'Health Insurance Policy',
    'Latest Blood Report',
  ];

  for (const name of defaultMedicineNames) {
    db.prepare('DELETE FROM medicines WHERE name = ? AND id IN (?, ?, ?)')
      .run(name, '1', '2', '3');
  }

  for (const name of defaultDocumentNames) {
    db.prepare('DELETE FROM documents WHERE name = ? AND id IN (?, ?, ?)')
      .run(name, '1', '2', '3');
  }
}

export function rowToMedicine(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    alias: row.alias,
    description: row.description,
    time: row.time,
    category: row.category,
    type: row.category,
    imageUrl: row.image_path,
    status: row.status,
  };
}

export function rowToEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    notes: row.notes,
    tag: row.tag,
    reminder: Boolean(row.reminder_enabled),
  };
}

export function rowToDocument(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: JSON.parse(row.tags_json || '[]'),
    description: row.description,
    type: row.file_type,
    fileType: row.file_type,
    url: row.file_path,
    uploadDate: row.upload_date,
  };
}

export function rowToSetup(row) {
  if (!row) return null;
  return {
    dadName: row.dad_name,
    sonName: row.son_name,
    sonPhone: row.son_phone,
    sonRelation: row.son_relation,
    city: row.city,
    language: row.language,
    theme: row.theme,
    profilePhotoUrl: row.profile_photo_path,
    newsTopics: JSON.parse(row.news_topics_json || '[]'),
  };
}

export { now, asJson };
