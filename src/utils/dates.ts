import { MONTHS } from '../data/routine';

export const pad = (n: number): string => String(n).padStart(2, '0');

export const dKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fmtD = (d: Date): string => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

export const todayIdx = (now = new Date()): number => (now.getDay() + 6) % 7;

export const monday = (d = new Date()): Date => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

export const dayDate = (i: number, ref = new Date()): Date => {
  const m = monday(ref);
  m.setDate(m.getDate() + i);
  return m;
};

export const dayNum = (d: Date): number =>
  Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);

export const isNeck = (d: Date): boolean => dayNum(d) % 2 === 0;

export const prevWeekKey = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 7);
  return dKey(dt);
};
