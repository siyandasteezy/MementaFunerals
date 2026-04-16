import { openDB, IDBPDatabase } from 'idb';
import { Program } from './types';

const PROGRAMS_KEY = 'mementa_programs';
const DB_NAME = 'mementa_db';
const DB_VERSION = 1;
const PDF_STORE = 'pdfs';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PDF_STORE)) {
        db.createObjectStore(PDF_STORE);
      }
    },
  });
}

// ---- Program metadata (localStorage) ----

export function saveProgram(program: Program): void {
  if (typeof window === 'undefined') return;
  const programs = getAllPrograms();
  const existing = programs.findIndex((p) => p.id === program.id);
  if (existing >= 0) {
    programs[existing] = program;
  } else {
    programs.push(program);
  }
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
}

export function getProgram(id: string): Program | null {
  if (typeof window === 'undefined') return null;
  const programs = getAllPrograms();
  return programs.find((p) => p.id === id) || null;
}

export function getAllPrograms(): Program[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PROGRAMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function updateProgramViews(id: string): void {
  if (typeof window === 'undefined') return;
  const program = getProgram(id);
  if (program) {
    program.views = (program.views || 0) + 1;
    saveProgram(program);
  }
}

export function deleteProgram(id: string): void {
  if (typeof window === 'undefined') return;
  const programs = getAllPrograms().filter((p) => p.id !== id);
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
  deletePDF(id);
}

// ---- PDF blobs (IndexedDB) ----

export async function savePDF(id: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put(PDF_STORE, blob, id);
}

export async function getPDF(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    const result = await db.get(PDF_STORE, id);
    return result || null;
  } catch {
    return null;
  }
}

export async function deletePDF(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(PDF_STORE, id);
  } catch {
    // ignore
  }
}
