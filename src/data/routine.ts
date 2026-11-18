import { CuidadoGroup, CuidadoItem, DayKey, DayMeta, DayRoutine, Exercise } from '../types';

export const DAYS: DayMeta[] = [
  { k: 'lun', s: 'LUN', n: 'Lunes' },
  { k: 'mar', s: 'MAR', n: 'Martes' },
  { k: 'mie', s: 'MIÉ', n: 'Miércoles' },
  { k: 'jue', s: 'JUE', n: 'Jueves' },
  { k: 'vie', s: 'VIE', n: 'Viernes' },
  { k: 'sab', s: 'SÁB', n: 'Sábado' },
  { k: 'dom', s: 'DOM', n: 'Domingo' },
];

export const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const VAC_IDX = [0, 2, 4]; // lunes, miércoles, viernes

export const ENTRENO: Record<DayKey, DayRoutine> = {
  lun: {
    title: 'Empuje alto + tracción pesada',
    tag: 'Oblicuos · salida a barra',
    blocks: [
      {
        name: 'Tracción',
        items: [
          { id: 'l1', name: 'Dominadas agarre pronado sin pulgar', sets: 2, reps: '6–10', bar: true, note: 'S1: 1–2 RIR · S2: 0–1 RIR' },
        ],
      },
      {
        name: 'Empuje',
        items: [
          { id: 'l2', name: 'Archer push-up', sets: 2, reps: '6–8 por lado' },
          { id: 'l3', name: 'Pike push-up con pies elevados', sets: 2, reps: '6–10' },
          { id: 'l4', name: 'Diamond push-up', sets: 2, reps: '8–12' },
          { id: 'l5', name: 'Vuelos laterales con mochila', sets: 2, reps: '12–15' },
        ],
      },
      {
        name: 'Oblicuos',
        items: [
          { id: 'l6', name: 'Windshield wipers colgado', sets: 2, reps: '4–6 por lado', bar: true },
        ],
      },
    ],
  },
  mar: {
    title: 'Pierna y control unilateral',
    tag: 'Semana sin Krav',
    blocks: [
      {
        name: 'Pierna',
        items: [
          { id: 'm1', name: 'Pistol asistida', sets: 2, reps: '5–8 por pierna' },
          { id: 'm2', name: 'Sentadilla búlgara con silla', sets: 2, reps: '8–10 por pierna' },
          { id: 'm3', name: 'Nordic curl excéntrico', sets: 2, reps: '4–6', note: 'bajada lenta de 4 s' },
          { id: 'm4', name: 'Puente de glúteo a una pierna', sets: 2, reps: '10–12 por pierna' },
          { id: 'm5', name: 'Elevación de talón a una pierna (gemelos)', sets: 2, reps: '12–15 por pierna' },
          { id: 'm6', name: 'Peso muerto rumano a una pierna', sets: 2, reps: '8–10 por pierna', note: 'excéntrica lenta' },
          { id: 'm7', name: 'Elevación de tibial anterior', sets: 1, reps: 'al fallo', note: 'protección al correr' },
          { id: 'm8', name: 'Wall angels', sets: 2, reps: '10–12' },
        ],
      },
    ],
  },
  mie: {
    title: 'Tracción horizontal + grip + core',
    tag: 'Barra baja o mesa',
    blocks: [
      {
        name: 'Tracción y agarre',
        items: [
          { id: 'w1', name: 'Remo invertido', sets: 2, reps: '8–12' },
          { id: 'w2', name: 'Shrugs con mochila', sets: 2, reps: '12–15' },
          { id: 'w3', name: 'Tuck front lever', sets: 2, reps: '8–10 s de sostén', bar: true, note: 'progresión hacia full front lever', isoSec: 10 },
          { id: 'w4', name: 'Dead hang', sets: 2, reps: '30–45 s', bar: true, note: 'suspensión pasiva', isoSec: 45 },
          { id: 'w5', name: 'Curl de muñeca supinado con mochila', sets: 2, reps: '12–15' },
          { id: 'w6', name: 'Curl de muñeca pronado con mochila', sets: 2, reps: '12–15' },
        ],
      },
    ],
  },
  jue: {
    title: 'Dominadas + dips + pecho',
    tag: 'Barra y paralelas',
    blocks: [
      {
        name: 'Calistenia',
        items: [
          { id: 'j1', name: 'Dominadas agarre abierto', sets: 2, reps: '6–8', bar: true, note: '1–2 RIR' },
          { id: 'j2', name: 'Dips en paralelas', sets: 2, reps: '6–10', bar: true, note: 'torso inclinado para pecho' },
          { id: 'j3', name: 'Elbow lever', sets: 2, reps: '8–10 s por nivel', bar: true, note: 'progresión', isoSec: 10 },
          { id: 'j4', name: 'Flexiones en dedos', sets: 2, reps: '8–12' },
          { id: 'j5', name: 'Planche lean', sets: 2, reps: '15–20 s', isoSec: 20 },
        ],
      },
    ],
  },
  vie: {
    title: 'Hombros + brazos + pecho',
    tag: 'Sin tracción vertical',
    blocks: [
      {
        name: 'Hombros y pecho',
        items: [
          { id: 'v1', name: 'Frog stand', sets: 2, reps: '15–20 s', note: 'progresión hacia handstand', isoSec: 20 },
          { id: 'v2', name: 'Pseudo planche push-up', sets: 2, reps: '6–8' },
          { id: 'v3', name: 'Upright raise con mochila', sets: 2, reps: '10–12', note: 'pecho superior' },
          { id: 'v4', name: 'Vuelos laterales con mochila', sets: 2, reps: '12–15' },
          { id: 'v5', name: 'Hollow body hold', sets: 2, reps: '20–30 s', isoSec: 30 },
        ],
      },
      {
        name: 'Brazos',
        items: [
          { id: 'v6', name: 'Curl isométrico en barra', sets: 2, reps: '15–20 s', bar: true, note: 'codos a 90°', isoSec: 20 },
          { id: 'v7', name: 'Flexión al fallo', sets: 1, reps: '0 RIR', note: 'presunción de pecho' },
        ],
      },
      {
        name: 'Cierre',
        items: [
          { id: 'v8', name: 'Wall angels', sets: 2, reps: '10–12' },
        ],
      },
    ],
  },
  sab: {
    title: 'Piernas + glúteos + aductores',
    tag: 'Todo en casa',
    blocks: [
      {
        name: 'Pierna y glúteo',
        items: [
          { id: 's1', name: 'Cossack squats', sets: 2, reps: '5–6 por pierna', note: 'movilidad profunda y aductores' },
          { id: 's2', name: 'Sentadilla búlgara', sets: 2, reps: '8–10 por pierna' },
          { id: 's3', name: 'Nordic curl excéntrico', sets: 2, reps: '4–6' },
          { id: 's4', name: 'Puente de glúteo con pausa de 2 s', sets: 2, reps: '10–12' },
          { id: 's5', name: 'Elevación de tibial anterior', sets: 1, reps: 'al fallo' },
        ],
      },
    ],
  },
  dom: {
    title: 'Cardio + abdominales',
    tag: 'Sin cargas externas',
    blocks: [
      {
        name: 'Cardio',
        items: [
          { id: 'd1', name: '20 min suave, zona 2', sets: 0, reps: 'checklist' },
        ],
      },
      {
        name: 'Abdominales',
        items: [
          { id: 'd2', name: 'Elevaciones tipo Graham', sets: 2, reps: '4–6', note: 'control estricto de la bajada' },
          { id: 'd3', name: 'Curl en banca con pies fijos', sets: 2, reps: '4–6', note: 'control estricto de la bajada' },
        ],
      },
    ],
  },
};

export const CUIDADO: CuidadoGroup[] = [
  {
    title: 'Cara',
    icon: 'smile',
    items: [
      { id: 'c_agua', label: 'Lavado con agua muy fría', hint: 'Al despertar, unos 30 s' },
      { id: 'c_mewing', label: 'Mewing', hint: 'Lengua en el paladar, labios cerrados, respiración nasal' },
      { id: 'c_cejas', label: 'Enfoque de cejas y mirada', hint: '2 × 20 con resistencia de los dedos' },
      { id: 'c_parp', label: 'Parpadeo con resistencia', hint: '2 × 10–20, 3 s cada vez' },
      { id: 'c_son', label: 'Sonrisa forzada (pómulos)', hint: '10 × 3 s con resistencia en las comisuras' },
      { id: 'c_beso', label: 'Beso con resistencia', hint: '2 × 15' },
      { id: 'c_cuch', label: 'Levantamiento de cuchara', hint: '' },
    ],
  },
  {
    title: 'Postura',
    icon: 'person-standing',
    items: [
      { id: 'c_chin', label: 'Chin tucks', hint: 'Contra pared o puerta' },
      { id: 'c_pecho', label: 'Estiramiento de pecho en marco de puerta', hint: '2 × 30 s por lado' },
    ],
  },
  {
    title: 'Espalda y hombros',
    icon: 'activity',
    items: [
      { id: 'c_rot', label: 'Rotaciones torácicas', hint: '30 s por lado' },
      { id: 'c_cobra', label: 'Postura de la cobra', hint: '1 min' },
      { id: 'c_enc', label: 'Por encima y por detrás', hint: '1 min' },
      { id: 'c_ang', label: 'Ángel invertido', hint: '1 min' },
    ],
  },
];

export const CUELLO: CuidadoItem[] = [
  { id: 'c_cu_a', label: 'Carga de cuello con disco, anterior', hint: '2 × 15–20 · 1–2 RIR' },
  { id: 'c_cu_p', label: 'Carga de cuello con disco, posterior', hint: '2 × 15–20 · 1–2 RIR' },
];

export const EXMAP: Record<string, Exercise> = {};
Object.values(ENTRENO).forEach((d) =>
  d.blocks.forEach((b) =>
    b.items.forEach((it) => {
      EXMAP[it.id] = it;
    }),
  ),
);
