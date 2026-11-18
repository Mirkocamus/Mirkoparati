import React, { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { CUELLO, DAYS, MONTHS } from '../data/routine';
import { AppState } from '../types';
import { dKey, dayDate, fmtD, isNeck } from '../utils/dates';
import { normalizeState } from '../utils/storage';
import { WeeklyVolumeChart } from './WeeklyVolumeChart';

interface SemanaViewProps {
  state: AppState;
  entDay: (i: number) => { done: number; total: number };
  cuiDay: (i: number) => { done: number; total: number };
  isCuiOn: (key: string, id: string, vac?: boolean) => boolean;
  onSelectDay: (i: number) => void;
  onImportState: (next: AppState) => void;
}

export const SemanaView: React.FC<SemanaViewProps> = ({
  state,
  entDay,
  cuiDay,
  isCuiOn,
  onSelectDay,
  onImportState,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupMsg, setBackupMsg] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  let et = 0;
  let et2 = 0;
  let ct = 0;
  let ct2 = 0;

  const dayStats = DAYS.map((d, i) => {
    const e = entDay(i);
    const c = cuiDay(i);
    et += e.done;
    et2 += e.total;
    ct += c.done;
    ct2 += c.total;
    return {
      d,
      i,
      date: dayDate(i),
      e,
      c,
      ePct: e.total ? Math.round((e.done / e.total) * 100) : 0,
      cPct: c.total ? Math.round((c.done / c.total) * 100) : 0,
    };
  });

  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  const base = new Date();
  const neckDays = Array.from({ length: 14 }, (_, idx) => {
    const o = idx - 6;
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + o);
    const k = dKey(d);
    const neck = isNeck(d);
    const done = CUELLO.every((it) => isCuiOn(k, it.id, it.vac));
    return { d, k, neck, done };
  });

  const handleExport = () => {
    try {
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mi-entreno-respaldo-${dKey(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMsg({
        type: 'ok',
        text: 'Respaldo descargado correctamente.',
      });
    } catch {
      setBackupMsg({
        type: 'err',
        text: 'No se pudo generar el archivo de respaldo.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeState(parsed);
      onImportState(normalized);
      setBackupMsg({
        type: 'ok',
        text: 'Historial importado y guardado correctamente.',
      });
    } catch (err) {
      setBackupMsg({
        type: 'err',
        text:
          err instanceof Error
            ? err.message
            : 'Archivo JSON inválido o dañado.',
      });
    }
  };

  return (
    <div className="space-y-7">
      <section className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-[#141417] border border-[#26262c] rounded-[1.25rem] p-4">
          <p className="text-xs text-zinc-400">Entreno</p>
          <p className="text-3xl font-extrabold t-ent tabular-nums mt-0.5">
            {pct(et, et2)}%
          </p>
          <p className="text-xs text-zinc-500 mt-1 tabular-nums">
            {et} de {et2} ejercicios
          </p>
        </div>

        <div className="bg-[#141417] border border-[#26262c] rounded-[1.25rem] p-4">
          <p className="text-xs text-zinc-400">Cuidado</p>
          <p className="text-3xl font-extrabold t-cui tabular-nums mt-0.5">
            {pct(ct, ct2)}%
          </p>
          <p className="text-xs text-zinc-500 mt-1 tabular-nums">
            {ct} de {ct2} hábitos
          </p>
        </div>
      </section>

      <WeeklyVolumeChart state={state} />

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-7 lg:space-y-0">
        <section className="lg:col-span-7">
          <h2 className="text-lg font-bold text-zinc-100">Días</h2>
          <div>
            {dayStats.map(({ d, i, date, e, c, ePct, cPct }) => (
              <button
                key={d.k}
                type="button"
                onClick={() => onSelectDay(i)}
                aria-label={`Ver ${d.n}`}
                className="bg-[#141417] border border-[#26262c] hover:border-[#34343c] rounded-[1.25rem] w-full text-left flex items-center gap-4 p-4 mt-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
              >
                <div className="w-14 shrink-0">
                  <p className="text-xs text-zinc-400">{d.s}</p>
                  <p className="font-extrabold text-lg tabular-nums">
                    {date.getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 tabular-nums">
                      <span>Entreno</span>
                      <span>
                        {e.done}/{e.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full g-ent transition-[width] duration-300"
                        style={{ width: `${ePct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 tabular-nums">
                      <span>Cuidado</span>
                      <span>
                        {c.done}/{c.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full g-cui transition-[width] duration-300"
                        style={{ width: `${cPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="lg:col-span-5 space-y-7">
          <section>
            <h2 className="text-lg font-bold t-cui">Carga de cuello</h2>
            <div
              className="grid grid-cols-7 gap-1.5 mt-3"
              role="list"
              aria-label="Calendario de carga de cuello"
            >
              {neckDays.map(({ d, k, neck, done }) => {
                const label = `${fmtD(d)}: ${neck ? 'toca cuello' : 'descanso'}${
                  done ? ', completado' : ''
                }`;
                return (
                  <div
                    key={k}
                    role="listitem"
                    aria-label={label}
                    className={`rounded-xl py-2 text-center border ${
                      done ? 'g-cui border-transparent text-[#042f2e]' : 'text-white'
                    }`}
                    style={
                      !done
                        ? {
                            borderColor: neck ? 'var(--cyan)' : 'var(--line)',
                            opacity: neck ? 1 : 0.5,
                          }
                        : undefined
                    }
                  >
                    <div
                      className={`text-[10px] tabular-nums ${
                        done ? '' : 'text-zinc-400'
                      }`}
                    >
                      {d.getDate()}
                    </div>
                    <div className="text-xs font-bold">
                      {MONTHS[d.getMonth()]}
                    </div>
                    <div className="text-[11px] mt-0.5 h-3">
                      {done ? '✓' : neck ? '●' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              ● toca cuello · ✓ completado. Se calcula por el calendario: día sí,
              día no.
            </p>
          </section>

          <section className="pt-4 border-t border-[#26262c]">
            <h2 className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-bold">
              Respaldo de datos
            </h2>
            <div className="flex flex-wrap gap-2.5 mt-3">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl border border-[#26262c] bg-[#141417] hover:border-zinc-500 text-xs font-semibold text-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Exportar JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl border border-[#26262c] bg-[#141417] hover:border-zinc-500 text-xs font-semibold text-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff2bd1]"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Importar JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Seleccionar archivo JSON de respaldo"
              />
            </div>

            {backupMsg && (
              <p
                role="status"
                className={`mt-2.5 text-xs ${
                  backupMsg.type === 'ok' ? 'text-[#2dd4bf]' : 'text-[#ff8095]'
                }`}
              >
                {backupMsg.text}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
