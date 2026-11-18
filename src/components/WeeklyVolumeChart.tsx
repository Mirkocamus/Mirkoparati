import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

export const WeeklyVolumeChart: React.FC<WeeklyVolumeChartProps> = ({
  state,
}) => {
  const { data, totalSeries } = useMemo(() => {
    const today = new Date();
    const points: ChartPoint[] = [];
    let sum = 0;

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
      points.push({
        label: offset === 0 ? 'Hoy' : `${dayMeta.s} ${d.getDate()}`,
        fullDate: `${dayMeta.n} ${fmtD(d)}`,
        series: completed,
        objetivo: planned,
      });
    }

    return { data: points, totalSeries: sum };
  }, [state]);

  return (
    <section className="bg-[#141417] border border-[#26262c] rounded-[1.25rem] p-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-base font-bold text-zinc-100">
          Volumen de entrenamiento
        </h2>
        <span className="text-xs text-zinc-400 tabular-nums whitespace-nowrap">
          Últimos 7 días · <strong className="text-[#ff9be9]">{totalSeries}</strong> series
        </span>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="entLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff1f3d" />
                <stop offset="100%" stopColor="#ff2bd1" />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#26262c"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              axisLine={{ stroke: '#26262c' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => Math.max(4, dataMax + 2)]}
            />
            <Tooltip
              cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const pt = payload[0].payload as ChartPoint;
                return (
                  <div className="rounded-xl border border-[#26262c] bg-[#09090b]/95 px-3 py-2 shadow-lg text-xs">
                    <p className="font-semibold text-zinc-200">{pt.fullDate}</p>
                    <p className="text-zinc-400 mt-0.5 tabular-nums">
                      <span className="font-bold text-[#ff7de5]">
                        {pt.series}
                      </span>{' '}
                      de {pt.objetivo} series completadas
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="series"
              stroke="url(#entLineGrad)"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: '#ff2bd1',
                stroke: '#141417',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#ff1f3d',
                stroke: '#f4f4f5',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
