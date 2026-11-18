import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { pad } from '../utils/dates';
import { playFinishBeep, unlockAudio } from '../utils/audio';

const PRESETS = [
  { s: 60, label: '60s' },
  { s: 90, label: '90s' },
  { s: 120, label: '2min' },
];

export const RestTimerBar: React.FC = () => {
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [flashing, setFlashing] = useState(false);

  const endRef = useRef(0);
  const ivRef = useRef<number | null>(null);

  const stopInterval = () => {
    if (ivRef.current !== null) {
      window.clearInterval(ivRef.current);
      ivRef.current = null;
    }
  };

  const tick = () => {
    const remaining = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
    setLeft(remaining);
    if (remaining <= 0) {
      stopInterval();
      setRunning(false);
      playFinishBeep();
      setFlashing(false);
      window.requestAnimationFrame(() => setFlashing(true));
    }
  };

  const startTimer = (sec: number) => {
    unlockAudio();
    stopInterval();
    setFlashing(false);
    setTotal(sec);
    setLeft(sec);
    endRef.current = Date.now() + sec * 1000;
    setRunning(true);
    ivRef.current = window.setInterval(tick, 250);
  };

  const toggleTimer = () => {
    unlockAudio();
    if (running) {
      stopInterval();
      setRunning(false);
      setLeft(Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000)));
    } else if (left > 0 && left < total) {
      endRef.current = Date.now() + left * 1000;
      setRunning(true);
      ivRef.current = window.setInterval(tick, 250);
    } else {
      startTimer(total || 60);
    }
  };

  const resetTimer = () => {
    stopInterval();
    setRunning(false);
    setFlashing(false);
    setLeft(total);
  };

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && ivRef.current !== null) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stopInterval();
    };
  }, []);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const pct = total ? (left / total) * 100 : 0;
  const btnLabel = running
    ? 'Pausar'
    : left > 0 && left < total
      ? 'Seguir'
      : 'Iniciar';

  return (
    <div
      className="fixed inset-x-0 bottom-[60px] z-40 border-t border-[#26262c] bg-[#141417]/95 backdrop-blur-md"
    >
      <div className="max-w-xl lg:max-w-5xl mx-auto px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xl sm:text-2xl tabular-nums w-[4.1rem] shrink-0 text-white"
            aria-live="off"
          >
            {pad(m)}:{pad(s)}
          </span>

          <div
            className="flex gap-1.5 flex-1 max-w-xs"
            role="group"
            aria-label="Duración del descanso"
          >
            {PRESETS.map((p) => {
              const on = total === p.s;
              return (
                <button
                  key={p.s}
                  type="button"
                  onClick={() => startTimer(p.s)}
                  className={`flex-1 h-9 rounded-[0.7rem] border font-bold text-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff2bd1] ${
                    on
                      ? 'border-transparent g-ent text-white'
                      : 'border-[#26262c] bg-[#1b1b20] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={toggleTimer}
            aria-label="Iniciar o pausar descanso"
            className="g-ent rounded-xl px-3.5 min-h-[38px] font-semibold text-sm text-white shrink-0 whitespace-nowrap active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
          >
            {btnLabel}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            aria-label="Reiniciar descanso"
            className="rounded-xl border border-[#26262c] bg-[#1b1b20] hover:border-zinc-500 min-h-[38px] w-10 flex items-center justify-center shrink-0 text-zinc-200 focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
          <div
            className={`h-full rounded-full g-ent transition-[width] duration-200 ${
              flashing ? 'animate-flash' : ''
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
