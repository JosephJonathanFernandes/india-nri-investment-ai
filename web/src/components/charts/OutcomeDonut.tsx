import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

type OutcomeDonutProps = {
  checks: Array<{ overallOutcome: string }>;
  className?: string;
};

const COLORS = {
  POTENTIALLY_ELIGIBLE: '#10b981',
  POTENTIAL_RESTRICTION: '#f59e0b',
  VERIFICATION_REQUIRED: '#3b82f6',
  INSUFFICIENT_INFO: '#94a3b8',
  UNRESOLVED: '#8b5cf6',
};

export function OutcomeDonut({ checks, className }: OutcomeDonutProps) {
  const counts: Record<string, number> = {};
  for (const c of checks) {
    counts[c.overallOutcome] = (counts[c.overallOutcome] || 0) + 1;
  }
  const total = checks.length;
  const data = Object.entries(counts).map(([outcome, value]) => ({
    outcome,
    value,
    color: COLORS[outcome as keyof typeof COLORS] ?? '#64748b',
  }));

  if (total === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
          <span className="text-sm">No eligibility checks yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="outcome"
              cx={110}
              cy={110}
              outerRadius={90}
              innerRadius={70}
              fill="#8884d8"
              labelLine={false}
              label={({ name, value, percent }: any) => {
                const pct = total ? Math.round((percent * 100) / total) : 0;
                return pct > 0 ? `${pct}%` : null;
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const entry = payload[0].payload as any;
                  const pct = total ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div className="p-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm">
                      <div className="font-medium text-navy-900 dark:text-white">
                        {entry.outcome}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {entry.value} check{payload.length > 1 ? 's' : ''} ({pct}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {data.map((d) => (
            <div key={d.outcome} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-navy-900 dark:text-white">{d.outcome}</span>
              <span className="text-gray-500 dark:text-gray-400">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
