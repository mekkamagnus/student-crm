import { DB } from "https://deno.land/x/sqlite/mod.ts";

export function initializeDatabase(path: string): DB {
  return new DB(path);
}

export function createSchema(db: DB): void {
  db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);
}
