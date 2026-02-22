import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export interface Book {
  id: string;
  title: string;
  filePath: string;
  fileName: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: number;
  createdAt: number;
}

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return SQLite.openDatabase({ name: 'BookHabbitor.db', location: 'default' });
};

export const createTables = async (db: SQLiteDatabase): Promise<void> => {
  const queryBooks = `
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      filePath TEXT NOT NULL,
      fileName TEXT NOT NULL,
      currentPage INTEGER DEFAULT 0,
      totalPages INTEGER NOT NULL,
      lastReadAt INTEGER,
      createdAt INTEGER NOT NULL
    );
  `;
  const querySessions = `
    CREATE TABLE IF NOT EXISTS reading_sessions (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      durationSeconds INTEGER NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `;
  await db.executeSql(queryBooks);
  await db.executeSql(querySessions);
};

export const updateBookProgress = async (db: SQLiteDatabase, id: string, currentPage: number): Promise<void> => {
  const query = `UPDATE books SET currentPage = ?, lastReadAt = ? WHERE id = ?`;
  await db.executeSql(query, [currentPage, Date.now(), id]);
};

export const saveReadingSession = async (db: SQLiteDatabase, bookId: string, durationSeconds: number): Promise<void> => {
  if (durationSeconds <= 0) return;
  const query = `
    INSERT INTO reading_sessions (id, bookId, durationSeconds, timestamp)
    VALUES (?, ?, ?, ?)
  `;
  await db.executeSql(query, [Date.now().toString(), bookId, durationSeconds, Date.now()]);
};

export const insertBook = async (db: SQLiteDatabase, book: Book): Promise<void> => {
  const query = `
    INSERT INTO books (id, title, filePath, fileName, currentPage, totalPages, lastReadAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    book.id,
    book.title,
    book.filePath,
    book.fileName,
    book.currentPage,
    book.totalPages,
    book.lastReadAt,
    book.createdAt,
  ];
  await db.executeSql(query, params);
};

export const initDatabase = async (): Promise<void> => {
  try {
    const db = await getDBConnection();
    await createTables(db);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

export const clearAllDatabaseData = async (db: SQLiteDatabase): Promise<void> => {
  try {
    await db.executeSql('DELETE FROM books');
    await db.executeSql('DELETE FROM reading_sessions');
  } catch (error) {
    console.error('Failed to clear database data:', error);
    throw error;
  }
};
