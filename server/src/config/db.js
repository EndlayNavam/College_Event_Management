import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

let database = null;

function getProjectRootPath() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const configDirectory = path.dirname(currentFilePath);
  const serverDirectory = path.resolve(configDirectory, "..", "..");
  return path.resolve(serverDirectory, "..");
}

function resolveDatabaseFilePath() {
  const projectRootPath = getProjectRootPath();
  const configuredPath =
    process.env.SQLITE_DB_PATH || "database/college_event_management.sqlite";

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(projectRootPath, configuredPath);
}

function resolveSqlDirectoryPath() {
  const projectRootPath = getProjectRootPath();
  return path.resolve(projectRootPath, "database", "sql");
}

function runSqlFiles(db) {
  const sqlDirectoryPath = resolveSqlDirectoryPath();
  if (!fs.existsSync(sqlDirectoryPath)) {
    throw new Error(`SQL directory not found: ${sqlDirectoryPath}`);
  }

  const sqlFiles = fs
    .readdirSync(sqlDirectoryPath)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  if (!sqlFiles.length) {
    throw new Error(`No .sql files found in ${sqlDirectoryPath}`);
  }

  for (const fileName of sqlFiles) {
    const filePath = path.join(sqlDirectoryPath, fileName);
    const sql = fs.readFileSync(filePath, "utf-8");
    db.exec(sql);
  }
}

function ensureRegistrationColumns(db) {
  const existingColumns = db
    .prepare("PRAGMA table_info(registrations)")
    .all()
    .map((row) => row.name);

  const columnsToEnsure = [
    {
      name: "participant_name",
      sql: "ALTER TABLE registrations ADD COLUMN participant_name TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "student_email",
      sql: "ALTER TABLE registrations ADD COLUMN student_email TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "phone",
      sql: "ALTER TABLE registrations ADD COLUMN phone TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "department",
      sql: "ALTER TABLE registrations ADD COLUMN department TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "year_of_study",
      sql: "ALTER TABLE registrations ADD COLUMN year_of_study TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "emergency_contact",
      sql: "ALTER TABLE registrations ADD COLUMN emergency_contact TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "additional_notes",
      sql: "ALTER TABLE registrations ADD COLUMN additional_notes TEXT NOT NULL DEFAULT ''"
    },
    {
      name: "agreed_to_terms",
      sql: "ALTER TABLE registrations ADD COLUMN agreed_to_terms INTEGER NOT NULL DEFAULT 0"
    }
  ];

  for (const column of columnsToEnsure) {
    if (!existingColumns.includes(column.name)) {
      db.exec(column.sql);
    }
  }
}

export async function connectDatabase() {
  const databaseFilePath = resolveDatabaseFilePath();
  fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

  database = new DatabaseSync(databaseFilePath);
  database.exec("PRAGMA foreign_keys = ON;");
  runSqlFiles(database);
  ensureRegistrationColumns(database);

  // eslint-disable-next-line no-console
  console.log(`Connected to SQLite at ${databaseFilePath}`);
}

export function getDb() {
  if (!database) {
    throw new Error("Database is not initialized. Call connectDatabase first.");
  }

  return database;
}
