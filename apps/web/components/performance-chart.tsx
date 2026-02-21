'use client';

import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';

interface ChartDataPoint {
    date: string;
    score: number | null;
}

interface PerformanceChartProps {
    data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-bold text-emerald-400">{payload[0].value}/100</p>
        </div>
    );
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                <div className="text-center">
                    <p className="text-lg mb-1">📊</p>
                    <p>No chart data yet.</p>
                    <p className="text-xs mt-1">Run your first audit to see performance trends.</p>
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
