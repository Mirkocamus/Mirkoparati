import { AppState } from '../types';

export const STORAGE_KEY = 'mi-entreno-v1';

export const emptyState = (): AppState => ({
  ent: {},
  notes: {},
  hab: {},
  vac: {},
});

export function loadState(): { state: AppState; storageOK: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        state: normalizeState(parsed),
        storageOK: true,
      };
    }
    return { state: emptyState(), storageOK: true };
  } catch {
    return { state: emptyState(), storageOK: false };
  }
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function normalizeState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('El archivo no contiene un objeto de respaldo válido.');
  }
  const obj = raw as Record<string, unknown>;
  const hasAnyKnownKey =
    'ent' in obj || 'notes' in obj || 'hab' in obj || 'vac' in obj;
  if (!hasAnyKnownKey) {
    throw new Error('Formato de respaldo no reconocido.');
  }

  const isPlainRecord = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);

  return {
    ent: isPlainRecord(obj.ent) ? (obj.ent as AppState['ent']) : {},
    notes: isPlainRecord(obj.notes) ? (obj.notes as AppState['notes']) : {},
    hab: isPlainRecord(obj.hab) ? (obj.hab as AppState['hab']) : {},
    vac: isPlainRecord(obj.vac) ? (obj.vac as AppState['vac']) : {},
  };
}
