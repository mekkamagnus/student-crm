import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { initializeDatabase, createSchema } from "../src/database.ts";

Deno.test("Database Initialization", () => {
  const db: DB = initializeDatabase(":memory:");
  assertEquals(db instanceof DB, true);
  db.close();
});

Deno.test("Schema Creation", () => {
  const db: DB = initializeDatabase(":memory:");
  createSchema(db);
  const tables = db.query<[string]>("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  assertEquals(tables.length, 1);
  assertEquals(tables[0][0], "users");
  db.close();
});
