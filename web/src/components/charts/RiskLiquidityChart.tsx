import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

type RiskLiquidityProps = {
  categories: Array<{
    name: string;
    riskLevel: string;
    liquidity: string;
  }>;
  className?: string;
};

const RISK_SCORE: Record<string, number> = {
  Low: 1,
  'Low-Moderate': 2,
  Moderate: 3,
  'Moderate-High': 4,
  High: 5,
};

const LIQUIDITY_SCORE: Record<string, number> = {
  Low: 1,
  Moderate: 2,
  High: 3,
};

export function RiskLiquidityChart({ categories, className }: RiskLiquidityProps) {
  const data = categories.map((c) => ({
    name: c.name.length > 18 ? c.name.slice(0, 15) + '...' : c.name,
    risk: RISK_SCORE[c.riskLevel ?? 'Moderate'] ?? 3,
    liquidity: LIQUIDITY_SCORE[c.liquidity ?? 'Moderate'] ?? 2,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis type="number" domain={[0, 5.5]} />
          <YAxis dataKey="name" type="category" width={130} />
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const entry = payload[0].payload as any;
                const riskLabel = Object.entries(RISK_SCORE).find(([, v]) => v === entry.risk)?.[0] ?? 'Moderate';
                const liqLabel = Object.entries(LIQUIDITY_SCORE).find(([, v]) => v === entry.liquidity)?.[0] ?? 'Moderate';
                return (
                  <div className="p-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm">
                    <div className="font-medium text-navy-900 dark:text-white">{entry.name}</div>
                    <div className="text-gray-600 dark:text-gray-400">Risk: {riskLabel}</div>
                    <div className="text-gray-600 dark:text-gray-400">Liquidity: {liqLabel}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="risk" fill="#10b981" radius={[0, 4, 4, 0]} />
          <Bar dataKey="liquidity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Green = Risk level &middot; Blue = Liquidity (scale 1&ndash;5)
      </p>
    </div>
  );
}
