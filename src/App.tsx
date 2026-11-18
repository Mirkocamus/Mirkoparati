import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Home, RotateCcw, Sun } from 'lucide-react';
import { CuidadoSection } from './components/CuidadoSection';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimerBar } from './components/RestTimerBar';
import { SemanaView } from './components/SemanaView';
import { CUELLO, CUIDADO, DAYS, ENTRENO, VAC_IDX } from './data/routine';
import { AppState, CuidadoItem, Exercise, IsoTimerState } from './types';
import {
  playCountdownTick,
  playFinishBeep,
  playPhaseStartBeep,
  unlockAudio,
} from './utils/audio';
import {
  dKey,
  dayDate,
  fmtD,
  isNeck,
  prevWeekKey,
  todayIdx,
} from './utils/dates';
import { loadState, saveState } from './utils/storage';

export default function App() {
  const [{ state: initialState, storageOK: initialStorageOK }] = useState(() =>
    loadState(),
  );
  const [state, setState] = useState<AppState>(initialState);
  const [storageOK, setStorageOK] = useState<boolean>(initialStorageOK);
  const [tab, setTab] = useState<'hoy' | 'semana'>('hoy');
  const [sel, setSel] = useState<number>(() => todayIdx());
  const [currentDayKey, setCurrentDayKey] = useState<string>(() =>
    dKey(new Date()),
  );
  const [confirmReset, setConfirmReset] = useState(false);

  // Wake Lock state
  const [wakeActive, setWakeActive] = useState(false);
  const [wakeNotice, setWakeNotice] = useState<string | null>(null);
  const wantWakeRef = useRef(false);
  const wakeSentinelRef = useRef<WakeLockSentinel | null>(null);

  // Isometric timer state
  const [isoTimer, setIsoTimer] = useState<IsoTimerState | null>(null);
  const isoIntervalRef = useRef<number | null>(null);
  const isoMetaRef = useRef<{
    exId: string;
    phase: 'prep' | 'work';
    end: number;
    isoSec: number;
    lastTick: number;
  } | null>(null);

  const persist = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      const ok = saveState(next);
      setStorageOK(ok);
      return next;
    });
  }, []);

  // Wake Lock handlers
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      wantWakeRef.current = false;
      setWakeActive(false);
      setWakeNotice('Pantalla activa no compatible en este navegador.');
      return;
    }
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      wakeSentinelRef.current = sentinel;
      setWakeActive(true);
      setWakeNotice(null);
      sentinel.addEventListener('release', () => {
        if (wakeSentinelRef.current === sentinel) {
          wakeSentinelRef.current = null;
          setWakeActive(false);
        }
      });
    } catch {
      wantWakeRef.current = false;
      setWakeActive(false);
      setWakeNotice('No se pudo mantener la pantalla activa.');
    }
  }, []);

  const toggleWakeLock = useCallback(async () => {
    if (wakeActive || wantWakeRef.current) {
      wantWakeRef.current = false;
      const sentinel = wakeSentinelRef.current;
      wakeSentinelRef.current = null;
      setWakeActive(false);
      if (sentinel) {
        try {
          await sentinel.release();
        } catch {
          // Ignore release error
        }
      }
    } else {
      wantWakeRef.current = true;
      await requestWakeLock();
    }
  }, [wakeActive, requestWakeLock]);

  useEffect(() => {
    if (!wakeNotice) return;
    const t = window.setTimeout(() => setWakeNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [wakeNotice]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      const nowKey = dKey(new Date());
      if (nowKey !== currentDayKey) {
        setCurrentDayKey(nowKey);
        setSel(todayIdx());
      }
      if (wantWakeRef.current && !wakeSentinelRef.current) {
        void requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (wakeSentinelRef.current) {
        void wakeSentinelRef.current.release().catch(() => {});
      }
    };
  }, [currentDayKey, requestWakeLock]);

  // Isometric timer control
  const stopIso = useCallback(() => {
    if (isoIntervalRef.current !== null) {
      window.clearInterval(isoIntervalRef.current);
      isoIntervalRef.current = null;
    }
    isoMetaRef.current = null;
    setIsoTimer(null);
  }, []);

  const startIso = useCallback(
    (ex: Exercise) => {
      if (typeof ex.isoSec !== 'number') return;
      unlockAudio();
      stopIso();

      const PREP_SEC = 5;
      const end = Date.now() + PREP_SEC * 1000;
      isoMetaRef.current = {
        exId: ex.id,
        phase: 'prep',
        end,
        isoSec: ex.isoSec,
        lastTick: PREP_SEC,
      };
      setIsoTimer({
        exId: ex.id,
        phase: 'prep',
        left: PREP_SEC,
        total: PREP_SEC,
      });
      playCountdownTick();

      isoIntervalRef.current = window.setInterval(() => {
        const meta = isoMetaRef.current;
        if (!meta) return;
        const rem = Math.max(0, Math.ceil((meta.end - Date.now()) / 1000));

        if (meta.phase === 'prep') {
          if (rem > 0 && rem < meta.lastTick) {
            meta.lastTick = rem;
            if (rem <= 3) playCountdownTick();
          }
          if (rem <= 0) {
            meta.phase = 'work';
            meta.end = Date.now() + meta.isoSec * 1000;
            meta.lastTick = meta.isoSec;
            playPhaseStartBeep();
            setIsoTimer({
              exId: meta.exId,
              phase: 'work',
              left: meta.isoSec,
              total: meta.isoSec,
            });
          } else {
            setIsoTimer({
              exId: meta.exId,
              phase: 'prep',
              left: rem,
              total: PREP_SEC,
            });
          }
        } else {
          if (rem <= 0) {
            stopIso();
            playFinishBeep();
          } else {
            setIsoTimer({
              exId: meta.exId,
              phase: 'work',
              left: rem,
              total: meta.isoSec,
            });
          }
        }
      }, 200);
    },
    [stopIso],
  );

  useEffect(() => () => stopIso(), [stopIso]);

  // Routine helpers
  const nSets = (ex: Exercise) => Math.max(1, ex.sets || 0);

  const getSetStates = (key: string, ex: Exercise): boolean[] => {
    const arr = state.ent[key]?.[ex.id] || [];
    return Array.from({ length: nSets(ex) }, (_, j) => !!arr[j]);
  };

  const isExDone = (key: string, ex: Exercise): boolean =>
    getSetStates(key, ex).every(Boolean);

  const allExercises = (i: number): Exercise[] =>
    ENTRENO[DAYS[i].k].blocks.flatMap((b) => b.items);

  const entDay = (i: number) => {
    const k = dKey(dayDate(i));
    const list = allExercises(i);
    return {
      done: list.filter((ex) => isExDone(k, ex)).length,
      total: list.length,
    };
  };

  const cuidadoList = (i: number): CuidadoItem[] => {
    const d = dayDate(i);
    const list: CuidadoItem[] = [];
    CUIDADO.forEach((g) =>
      g.items.forEach((it) => list.push({ ...it, grp: g.title })),
    );
    if (VAC_IDX.includes(i)) {
      list.push({
        id: 'vac',
        vac: true,
        label: 'Stomach vacuum',
        hint: 'En ayunas · 3–5 series de 10–15 s · mínimo 3',
        grp: 'Ayunas',
      });
    }
    if (isNeck(d)) {
      CUELLO.forEach((it) =>
        list.push({ ...it, grp: 'Cuello · hoy toca' }),
      );
    }
    return list;
  };

  const isCuiOn = (k: string, id: string, vac?: boolean): boolean =>
    vac ? (state.vac[k] || 0) >= 3 : !!(state.hab[k] && state.hab[k][id]);

  const cuiDay = (i: number) => {
    const k = dKey(dayDate(i));
    const list = cuidadoList(i);
    return {
      done: list.filter((it) => isCuiOn(k, it.id, it.vac)).length,
      total: list.length,
    };
  };

  // Actions
  const activeKey = dKey(dayDate(sel));
  const lastWeekKey = prevWeekKey(activeKey);

  const handleToggleEx = (ex: Exercise) => {
    const on = isExDone(activeKey, ex);
    persist((prev) => ({
      ...prev,
      ent: {
        ...prev.ent,
        [activeKey]: {
          ...(prev.ent[activeKey] || {}),
          [ex.id]: Array.from({ length: nSets(ex) }, () => !on),
        },
      },
    }));
  };

  const handleToggleSet = (ex: Exercise, j: number) => {
    const s = getSetStates(activeKey, ex);
    s[j] = !s[j];
    persist((prev) => ({
      ...prev,
      ent: {
        ...prev.ent,
        [activeKey]: {
          ...(prev.ent[activeKey] || {}),
          [ex.id]: s,
        },
      },
    }));
  };

  const handleNoteChange = (exId: string, val: string) => {
    persist((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [activeKey]: {
          ...(prev.notes[activeKey] || {}),
          [exId]: val,
        },
      },
    }));
  };

  const handleToggleHab = (id: string) => {
    persist((prev) => ({
      ...prev,
      hab: {
        ...prev.hab,
        [activeKey]: {
          ...(prev.hab[activeKey] || {}),
          [id]: !prev.hab[activeKey]?.[id],
        },
      },
    }));
  };

  const handleSetVac = (n: number) => {
    persist((prev) => {
      const cur = prev.vac[activeKey] || 0;
      return {
        ...prev,
        vac: {
          ...prev.vac,
          [activeKey]: cur === n ? n - 1 : n,
        },
      };
    });
  };

  const handleResetDay = () => {
    persist((prev) => {
      const nextEnt = { ...prev.ent };
      const nextHab = { ...prev.hab };
      const nextVac = { ...prev.vac };
      const nextNotes = { ...prev.notes };
      delete nextEnt[activeKey];
      delete nextHab[activeKey];
      delete nextVac[activeKey];
      delete nextNotes[activeKey];
      return {
        ent: nextEnt,
        hab: nextHab,
        vac: nextVac,
        notes: nextNotes,
      };
    });
    setConfirmReset(false);
  };

  const handleImportState = (next: AppState) => {
    const ok = saveState(next);
    setStorageOK(ok);
    setState(next);
  };

  const todayIndex = todayIdx();
  const selRoutine = ENTRENO[DAYS[sel].k];
  const selEntStats = entDay(sel);
  const selEntPct = selEntStats.total
    ? Math.round((selEntStats.done / selEntStats.total) * 100)
    : 0;
  const selCuiItems = cuidadoList(sel);
  const selCuiStats = cuiDay(sel);

  return (
    <>
      <main className="max-w-xl lg:max-w-5xl mx-auto px-4 pt-6 pb-48">
        {/* Header */}
        <header className="glow -mx-2 px-2 pb-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                {tab === 'semana'
                  ? 'Esta semana'
                  : `${DAYS[todayIndex].n} ${fmtD(new Date())}`}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-balance">
                {tab === 'semana' ? (
                  'Progreso'
                ) : (
                  <>
                    Mi <span className="t-ent">entreno</span> y{' '}
                    <span className="t-cui">cuidado</span>
                  </>
                )}
              </h1>
            </div>

            <button
              type="button"
              onClick={toggleWakeLock}
              aria-pressed={wakeActive}
              aria-label={
                wakeActive
                  ? 'Desactivar pantalla activa'
                  : 'Mantener pantalla activa durante el entreno'
              }
              title={
                wakeActive
                  ? 'Pantalla activa: ON (toca para desactivar)'
                  : 'Mantener pantalla activa'
              }
              className={`shrink-0 mt-1 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#ff2bd1] ${
                wakeActive
                  ? 'border-[#2dd4bf]/60 bg-[#2dd4bf]/15 text-[#2dd4bf]'
                  : 'border-[#26262c] bg-[#141417]/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
              }`}
            >
              <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
          </div>

          {wakeNotice && (
            <p className="mt-2 text-xs text-zinc-400" role="status">
              {wakeNotice}
            </p>
          )}

          {!storageOK && (
            <p className="mt-3 text-sm rounded-xl px-3 py-2 bg-[#ff1f3d]/10 border border-[#ff1f3d]/40 text-[#ffb3bf]">
              No se puede guardar en este navegador. El progreso se perderá al
              cerrar.
            </p>
          )}
        </header>

        {tab === 'semana' ? (
          <SemanaView
            state={state}
            entDay={entDay}
            cuiDay={cuiDay}
            isCuiOn={isCuiOn}
            onSelectDay={(i) => {
              setSel(i);
              setConfirmReset(false);
              setTab('hoy');
            }}
            onImportState={handleImportState}
          />
        ) : (
          <>
            {/* Day Strip */}
            <nav
              className="grid grid-cols-7 gap-1.5 mt-5"
              aria-label="Días de la semana"
            >
              {DAYS.map((d, i) => {
                const dt = dayDate(i);
                const e = entDay(i);
                const c = cuiDay(i);
                const on = i === sel;
                const isToday = i === todayIndex;
                const eDone = e.total > 0 && e.done === e.total;
                const cDone = c.total > 0 && c.done === c.total;

                return (
                  <button
                    key={d.k}
                    type="button"
                    onClick={() => {
                      setSel(i);
                      setConfirmReset(false);
                    }}
                    aria-pressed={on}
                    aria-label={`${d.n} ${dt.getDate()}${
                      isToday ? ', hoy' : ''
                    }`}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-2xl border transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-[#ff2bd1] ${
                      on
                        ? 'border-transparent g-ent text-white'
                        : isToday
                          ? 'border-[#ff2bd1] bg-[#141417] text-white'
                          : 'border-[#26262c] bg-[#141417] text-white hover:border-zinc-600'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-semibold ${
                        on ? 'text-white' : 'text-zinc-400'
                      }`}
                    >
                      {d.s}
                    </span>
                    <span className="text-lg font-extrabold leading-none tabular-nums">
                      {dt.getDate()}
                    </span>
                    <span className="flex gap-1 mt-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#ff1f3d]"
                        style={{ opacity: eDone ? 1 : 0.25 }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]"
                        style={{ opacity: cDone ? 1 : 0.25 }}
                      />
                    </span>
                  </button>
                );
              })}
            </nav>

            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff1f3d]" />
                Entreno
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
                Cuidado
              </span>
            </p>

            {/* Main 2-column responsive content */}
            <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
              {/* Entreno Section */}
              <section className="lg:col-span-7">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                      {DAYS[sel].n} {fmtD(dayDate(sel))}
                      {sel === todayIndex ? ' · hoy' : ''}
                    </p>
                    <h2 className="text-2xl font-extrabold tracking-tight text-balance">
                      {selRoutine.title}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {selRoutine.tag}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-[#ff9be9]">
                    {selEntStats.done}/{selEntStats.total}
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full g-ent transition-[width] duration-300"
                    style={{ width: `${selEntPct}%` }}
                  />
                </div>

                {selRoutine.blocks.map((block) => (
                  <div key={block.name}>
                    <h3 className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-bold mt-5">
                      {block.name}
                    </h3>
                    {block.items.map((ex) => (
                      <ExerciseCard
                        key={`${activeKey}-${ex.id}`}
                        ex={ex}
                        dayKey={activeKey}
                        setStates={getSetStates(activeKey, ex)}
                        done={isExDone(activeKey, ex)}
                        noteVal={state.notes[activeKey]?.[ex.id] || ''}
                        prevNote={state.notes[lastWeekKey]?.[ex.id]?.trim()}
                        isoTimer={isoTimer}
                        onToggleEx={handleToggleEx}
                        onToggleSet={handleToggleSet}
                        onNoteChange={handleNoteChange}
                        onStartIso={startIso}
                        onStopIso={stopIso}
                      />
                    ))}
                  </div>
                ))}
              </section>

              {/* Cuidado Section */}
              <div className="lg:col-span-5">
                <CuidadoSection
                  list={selCuiItems}
                  doneCount={selCuiStats.done}
                  totalCount={selCuiStats.total}
                  vacCount={state.vac[activeKey] || 0}
                  habState={state.hab[activeKey] || {}}
                  onToggleHab={handleToggleHab}
                  onSetVac={handleSetVac}
                />
              </div>
            </div>

            {/* Reset Day */}
            <div className="mt-8 flex justify-end items-center gap-2">
              {confirmReset ? (
                <div className="flex items-center gap-2 bg-[#141417] border border-[#26262c] rounded-xl px-3 py-1.5">
                  <span className="text-xs text-zinc-300">
                    ¿Borrar lo marcado de este día?
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDay}
                    className="px-2.5 py-1 rounded-lg bg-[#ff1f3d] text-white text-xs font-bold whitespace-nowrap"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 rounded-lg border border-[#26262c] text-zinc-300 text-xs font-semibold whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-[0.9rem] border border-dashed border-[#3f3f46] hover:border-[#ff2bd1] text-zinc-400 hover:text-white text-sm transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reiniciar este día</span>
                </button>
              )}
            </div>
          </>
        )}
      </main>

      {/* Rest Timer */}
      <RestTimerBar />

      {/* Bottom Tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#26262c] bg-[#09090b]/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="max-w-xl lg:max-w-5xl mx-auto px-4 py-1.5 flex gap-2"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'hoy'}
            onClick={() => setTab('hoy')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ff2bd1] ${
              tab === 'hoy'
                ? 'text-white bg-[#1b1b20]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>Hoy</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === 'semana'}
            onClick={() => setTab('semana')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ff2bd1] ${
              tab === 'semana'
                ? 'text-white bg-[#1b1b20]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-5 h-5" aria-hidden="true" />
            <span>Semana</span>
          </button>
        </div>
      </nav>
    </>
  );
}
