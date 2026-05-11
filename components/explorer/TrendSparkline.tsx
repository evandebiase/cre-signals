'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

type Props = {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
};

export function TrendSparkline({ data, color = '#00D4AA', height = 48 }: Props) {
  if (!data || data.length < 2) {
    return <div className="skeleton" style={{ height }} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
        <Tooltip
          contentStyle={{
            background: '#0D1530',
            border: '1px solid #162149',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            padding: '4px 8px',
          }}
          labelStyle={{ display: 'none' }}
          formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : v, '']}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
