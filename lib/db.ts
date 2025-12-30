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
      ip TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration for existing tables without 'ip' column
  // This is a simple guard to add the column if it doesn't exist.
  try {
    db.exec("ALTER TABLE interactions ADD COLUMN ip TEXT");
  } catch (e: any) {
    if (!e.message.includes("duplicate column name")) {
      console.warn("Migration warning:", e.message);
    }
  }

} catch (e) {
  console.warn("Table Creation Failed (Expected in Vercel):", e);
}

export function logInteraction(level: number, prompt: string, response: string, success: boolean, ip: string = 'unknown') {
  try {
    const stmt = db.prepare('INSERT INTO interactions (level, prompt, response, success, ip) VALUES (?, ?, ?, ?, ?)');
    stmt.run(level, prompt, response, success ? 1 : 0, ip);
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
