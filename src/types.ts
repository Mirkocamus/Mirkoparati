export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

export interface DayMeta {
  k: DayKey;
  s: string;
  n: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  bar?: boolean;
  note?: string;
  isoSec?: number;
}

export interface ExerciseBlock {
  name: string;
  items: Exercise[];
}

export interface DayRoutine {
  title: string;
  tag: string;
  blocks: ExerciseBlock[];
}

export interface CuidadoItem {
  id: string;
  label: string;
  hint: string;
  vac?: boolean;
  grp?: string;
}

export interface CuidadoGroup {
  title: string;
  icon: string;
  items: CuidadoItem[];
}

export interface AppState {
  ent: Record<string, Record<string, boolean[]>>;
  notes: Record<string, Record<string, string>>;
  hab: Record<string, Record<string, boolean>>;
  vac: Record<string, number>;
}

export interface IsoTimerState {
  exId: string;
  phase: 'prep' | 'work';
  left: number;
  total: number;
}
