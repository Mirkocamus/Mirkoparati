import React from 'react';
import { Check, Play, Square } from 'lucide-react';
import { Exercise, IsoTimerState } from '../types';

interface ExerciseCardProps {
  ex: Exercise;
  dayKey: string;
  setStates: boolean[];
  done: boolean;
  noteVal: string;
  prevNote?: string;
  isoTimer: IsoTimerState | null;
  onToggleEx: (ex: Exercise) => void;
  onToggleSet: (ex: Exercise, setIndex: number) => void;
  onNoteChange: (exId: string, val: string) => void;
  onStartIso: (ex: Exercise) => void;
  onStopIso: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  ex,
  dayKey,
  setStates,
  done,
  noteVal,
  prevNote,
  isoTimer,
  onToggleEx,
  onToggleSet,
  onNoteChange,
  onStartIso,
  onStopIso,
}) => {
  const meta = [ex.sets ? `${ex.sets} × ${ex.reps}` : ex.reps, ex.note]
    .filter(Boolean)
    .join(' · ');

  const placeholder = prevNote ? `Sem. pasada: ${prevNote}` : 'reps / kg';
  const isIsoActive = isoTimer?.exId === ex.id;
  const isoPct =
    isIsoActive && isoTimer.total > 0
      ? Math.round((isoTimer.left / isoTimer.total) * 100)
      : 0;

  return (
    <article
      className={`bg-[#141417] border rounded-[1.25rem] flex gap-3.5 items-start px-4 py-3.5 mt-2.5 transition-colors ${
        isIsoActive
          ? 'border-[#ff2bd1]/60'
          : 'border-[#26262c] hover:border-[#34343c]'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleEx(ex)}
        aria-pressed={done}
        aria-label={`Marcar ${ex.name}`}
        className={`w-8 h-8 mt-0.5 flex-none rounded-[0.7rem] border-[1.5px] flex items-center justify-center transition-transform active:scale-92 focus-visible:outline-2 focus-visible:outline-[#ff2bd1] focus-visible:outline-offset-2 ${
          done
            ? 'border-transparent g-ent text-white'
            : 'border-[#3f3f46] bg-transparent text-white'
        }`}
      >
        {done && <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`font-semibold leading-snug ${
                done ? 'line-through text-zinc-500' : 'text-zinc-100'
              }`}
            >
              {ex.name}
              {ex.bar && (
                <span className="inline-block ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-[#ff8095] border border-[#ff1f3d]/45 bg-[#ff1f3d]/10 align-middle whitespace-nowrap">
                  barra
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{meta}</p>
          </div>

          {typeof ex.isoSec === 'number' && !isIsoActive && (
            <button
              type="button"
              onClick={() => onStartIso(ex)}
              aria-label={`Iniciar cronómetro de ${ex.isoSec} segundos para ${ex.name}`}
              title={`5 s para colocarse + ${ex.isoSec} s de sostén`}
              className="shrink-0 inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl border border-[#26262c] bg-[#1b1b20] hover:border-[#ff2bd1]/60 hover:text-white text-zinc-200 text-xs font-bold tabular-nums transition-colors active:scale-95 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
            >
              <Play className="w-3.5 h-3.5 text-[#ff2bd1] fill-[#ff2bd1]" aria-hidden="true" />
              <span>{ex.isoSec}s</span>
            </button>
          )}

          {isIsoActive && (
            <button
              type="button"
              onClick={onStopIso}
              aria-label={`Detener cronómetro de ${ex.name}`}
              className="shrink-0 inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl border border-[#ff1f3d]/50 bg-[#ff1f3d]/15 text-[#ff95a5] text-xs font-bold transition-colors active:scale-95 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
            >
              <Square className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>Parar</span>
            </button>
          )}
        </div>

        {isIsoActive && (
          <div
            className="mt-2.5 rounded-xl bg-[#0e0e11] border border-[#26262c] px-3 py-2"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={`font-semibold ${
                  isoTimer.phase === 'prep' ? 'text-amber-300' : 'text-[#ff7de5]'
                }`}
              >
                {isoTimer.phase === 'prep' ? 'Colócate…' : 'Mantén la posición'}
              </span>
              <span className="font-mono text-base font-bold tabular-nums text-white">
                {isoTimer.left}s
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-[width] duration-200 ${
                  isoTimer.phase === 'prep' ? 'bg-amber-400' : 'g-ent'
                }`}
                style={{ width: `${isoPct}%` }}
              />
            </div>
          </div>
        )}

        {Math.max(1, ex.sets || 0) > 1 && (
          <div
            className="flex gap-1.5 mt-2.5"
            role="group"
            aria-label={`Series de ${ex.name}`}
          >
            {setStates.map((v, j) => (
              <button
                key={`${dayKey}-${ex.id}-s-${j}`}
                type="button"
                onClick={() => onToggleSet(ex, j)}
                aria-pressed={v}
                aria-label={`Serie ${j + 1}`}
                className={`w-9 h-9 rounded-[0.65rem] border font-bold text-xs transition-transform active:scale-92 focus-visible:outline-2 focus-visible:outline-[#ff2bd1] ${
                  v
                    ? 'border-transparent g-ent text-white'
                    : 'border-[#26262c] bg-[#1b1b20] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {j + 1}
              </button>
            ))}
          </div>
        )}

        {ex.sets > 0 && (
          <input
            type="text"
            value={noteVal}
            onChange={(e) => onNoteChange(ex.id, e.target.value)}
            placeholder={placeholder}
            aria-label={`Anotar reps o kg de ${ex.name}`}
            className="mt-2.5 w-full max-w-[15rem] bg-[#0e0e11] border border-[#26262c] rounded-[0.7rem] px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 min-h-[2.35rem] focus:border-[#ff2bd1] focus:outline-none"
          />
        )}
      </div>
    </article>
  );
};
