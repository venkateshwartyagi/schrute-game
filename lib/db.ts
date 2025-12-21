import Database from 'better-sqlite3';
import path from 'path';

// In Next.js, we need to be careful with DB connections in dev mode reloading.
// This is a simple implementation.

const dbPath = path.join(process.cwd(), 'schrute.db');
let db: any;
try {
  db = new Database(dbPath);
} catch (e) {
  console.warn("Failed to initialize DB:", e);
  db = {
    exec: () => { },
    prepare: () => ({ run: () => { }, all: () => [] })
  };
}

// Initialize DB
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level INTEGER,
      prompt TEXT,
      response TEXT,
      success BOOLEAN,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (e) {
  console.warn("Table Creation Failed (Expected in Vercel):", e);
}

export function logInteraction(level: number, prompt: string, response: string, success: boolean) {
  try {
    const stmt = db.prepare('INSERT INTO interactions (level, prompt, response, success) VALUES (?, ?, ?, ?)');
    stmt.run(level, prompt, response, success ? 1 : 0);
  } catch (e) {
    console.warn("DB Write Failed (Expected in Vercel):", e);
  }
}

export function getLogs() {
  try {
    return db.prepare('SELECT * FROM interactions ORDER BY timestamp DESC LIMIT 100').all();
  } catch (e) {
    console.warn("DB Read Failed:", e);
    return [];
  }
}

export default db;
