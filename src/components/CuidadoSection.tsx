import React from 'react';
import { Check } from 'lucide-react';
import { CuidadoItem } from '../types';

interface CuidadoSectionProps {
  list: CuidadoItem[];
  doneCount: number;
  totalCount: number;
  vacCount: number;
  habState: Record<string, boolean>;
  onToggleHab: (id: string) => void;
  onSetVac: (n: number) => void;
}

export const CuidadoSection: React.FC<CuidadoSectionProps> = ({
  list,
  doneCount,
  totalCount,
  vacCount,
  habState,
  onToggleHab,
  onSetVac,
}) => {
  const groups: { title: string; items: CuidadoItem[] }[] = [];
  list.forEach((it) => {
    const grpTitle = it.grp || 'General';
    let g = groups.find((x) => x.title === grpTitle);
    if (!g) {
      g = { title: grpTitle, items: [] };
      groups.push(g);
    }
    g.items.push(it);
  });

  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section className="mt-9 lg:mt-0">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight t-cui">Cuidado</h2>
        <span className="text-xs font-bold tabular-nums text-[#7ff0e0]">
          {doneCount}/{totalCount}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-3">
        <div
          className="h-full rounded-full g-cui transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {groups.map((g) => (
        <div key={g.title}>
          <h3 className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-bold mt-5">
            {g.title}
          </h3>
          {g.items.map((it) => {
            if (it.vac) {
              return (
                <div
                  key={it.id}
                  className="bg-[#141417] border border-[#26262c] rounded-[1.25rem] flex items-center px-4 py-3.5 mt-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-100">{it.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{it.hint}</p>
                    <div
                      className="flex gap-1.5 mt-2.5"
                      role="group"
                      aria-label="Series de stomach vacuum"
                    >
                      {[1, 2, 3, 4, 5].map((j) => {
                        const active = j <= vacCount;
                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => onSetVac(j)}
                            aria-pressed={active}
                            aria-label={`Serie ${j}`}
                            className={`w-10 h-10 rounded-full border-[1.5px] font-bold text-sm transition-transform active:scale-92 focus-visible:outline-2 focus-visible:outline-[#2dd4bf] ${
                              active
                                ? 'border-transparent g-cui text-[#042f2e]'
                                : 'border-[#3f3f46] bg-transparent text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            {j}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const on = !!habState[it.id];
            return (
              <article
                key={it.id}
                className="bg-[#141417] border border-[#26262c] hover:border-[#34343c] rounded-[1.25rem] flex gap-3.5 items-start px-4 py-3.5 mt-2.5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onToggleHab(it.id)}
                  aria-pressed={on}
                  aria-label={`Marcar ${it.label}`}
                  className={`w-8 h-8 mt-0.5 flex-none rounded-[0.7rem] border-[1.5px] flex items-center justify-center transition-transform active:scale-92 focus-visible:outline-2 focus-visible:outline-[#2dd4bf] focus-visible:outline-offset-2 ${
                    on
                      ? 'border-transparent g-cui text-[#042f2e]'
                      : 'border-[#3f3f46] bg-transparent text-white'
                  }`}
                >
                  {on && <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold leading-snug ${
                      on ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {it.label}
                  </p>
                  {it.hint && (
                    <p className="text-xs text-zinc-400 mt-0.5">{it.hint}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ))}
    </section>
  );
};
