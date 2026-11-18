import React, { useMemo, useState } from 'react';
import { DAYS, ENTRENO } from '../data/routine';
import { AppState } from '../types';
import { dKey, fmtD } from '../utils/dates';

interface WeeklyVolumeChartProps {
  state: AppState;
}

interface ChartPoint {
  label: string;
  fullDate: string;
  series: number;
  objetivo: number;
}

const VB_W = 560;
const VB_H = 190;
const PAD_L = 28;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 28;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

function buildSmoothPath(coords: { x: number; y: number }[], minY: number, maxY: number): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  const clampY = (y: number) => Math.max(minY, Math.min(maxY, y));
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clampY(p1.y + (p2.y - p0.y) / 6);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clampY(p2.y - (p3.y - p1.y) / 6);

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export const WeeklyVolumeChart: React.FC<WeeklyVolumeChartProps> = ({
  state,
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const { data, totalSeries, yMax, yTicks } = useMemo(() => {
    const today = new Date();
    const points: ChartPoint[] = [];
    let sum = 0;
    let peak = 0;

    for (let offset = -6; offset <= 0; offset++) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + offset,
      );
      const k = dKey(d);
      const dayIdx = (d.getDay() + 6) % 7;
      const dayMeta = DAYS[dayIdx];
      const items = ENTRENO[dayMeta.k].blocks.flatMap((b) => b.items);

      let completed = 0;
      let planned = 0;

      items.forEach((ex) => {
        const n = Math.max(1, ex.sets || 0);
        planned += n;
        const arr = state.ent[k]?.[ex.id] || [];
        for (let j = 0; j < n; j++) {
          if (arr[j]) completed += 1;
        }
      });

      sum += completed;
      if (completed > peak) peak = completed;

      points.push({
        label: offset === 0 ? 'Hoy' : `${dayMeta.s} ${d.getDate()}`,
        fullDate: `${dayMeta.n} ${fmtD(d)}`,
        series: completed,
        objetivo: planned,
      });
    }

    const rawMax = Math.max(8, peak + 2);
    const maxVal = Math.ceil(rawMax / 2) * 2;
    const ticks = [0, Math.round(maxVal / 2), maxVal];

    return { data: points, totalSeries: sum, yMax: maxVal, yTicks: ticks };
  }, [state]);

  const coords = useMemo(
    () =>
      data.map((pt, idx) => {
        const x = PAD_L + (idx / Math.max(1, data.length - 1)) * PLOT_W;
        const y = PAD_T + PLOT_H - (pt.series / yMax) * PLOT_H;
        return { x, y };
      }),
    [data, yMax],
  );

  const linePath = useMemo(
    () => buildSmoothPath(coords, PAD_T, PAD_T + PLOT_H),
    [coords],
  );

  const areaPath = useMemo(() => {
    if (!coords.length || !linePath) return '';
    const baseY = (PAD_T + PLOT_H).toFixed(1);
    const lastX = coords[coords.length - 1].x.toFixed(1);
    const firstX = coords[0].x.toFixed(1);
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [coords, linePath]);

  const selected = activeIdx !== null ? data[activeIdx] : null;

  return (
    <section className="bg-[#141417] border border-[#26262c] rounded-[1.25rem] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h2 className="text-base font-bold text-zinc-100">
          Volumen de entrenamiento
        </h2>
        <span className="text-xs text-zinc-400 tabular-nums whitespace-nowrap">
          {selected ? (
            <>
              {selected.fullDate} ·{' '}
              <strong className="text-[#ff9be9]">{selected.series}</strong> de{' '}
              {selected.objetivo} series
            </>
          ) : (
            <>
              Últimos 7 días ·{' '}
              <strong className="text-[#ff9be9]">{totalSeries}</strong> series
            </>
          )}
        </span>
      </div>

      <div
        className="w-full select-none"
        onMouseLeave={() => setActiveIdx(null)}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-48 overflow-visible"
          role="img"
          aria-label="Gráfico de series completadas en los últimos 7 días"
        >
          <defs>
            <linearGradient id="entSvgLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff1f3d" />
              <stop offset="100%" stopColor="#ff2bd1" />
            </linearGradient>
            <linearGradient id="entSvgArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff2bd1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ff1f3d" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y Ticks */}
          {yTicks.map((tick) => {
            const y = PAD_T + PLOT_H - (tick / yMax) * PLOT_H;
            return (
              <g key={tick}>
                <line
                  x1={PAD_L}
                  y1={y}
                  x2={VB_W - PAD_R}
                  y2={y}
                  stroke="#26262c"
                  strokeDasharray={tick === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={PAD_L - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-500 text-[11px] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#entSvgArea)" />}

          {/* Line Stroke */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#entSvgLine)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active Crosshair */}
          {activeIdx !== null && coords[activeIdx] && (
            <line
              x1={coords[activeIdx].x}
              y1={PAD_T}
              x2={coords[activeIdx].x}
              y2={PAD_T + PLOT_H}
              stroke="#3f3f46"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Data Points, X Labels & Hit Areas */}
          {data.map((pt, idx) => {
            const { x, y } = coords[idx];
            const isActive = activeIdx === idx;
            const colWidth = PLOT_W / data.length;

            return (
              <g
                key={pt.fullDate}
                className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() =>
                  setActiveIdx((prev) => (prev === idx ? null : idx))
                }
              >
                {/* Invisible larger touch/hover target */}
                <rect
                  x={x - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={VB_H}
                  fill="transparent"
                />

                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6 : 4}
                  fill={isActive ? '#ff1f3d' : '#ff2bd1'}
                  stroke={isActive ? '#f4f4f5' : '#141417'}
                  strokeWidth="2"
                />

                <text
                  x={x}
                  y={VB_H - 6}
                  textAnchor="middle"
                  className={`text-[10.5px] font-semibold ${
                    isActive ? 'fill-zinc-100' : 'fill-zinc-400'
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
