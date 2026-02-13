'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';
import {
    Activity, AlertTriangle, CheckCircle, Timer, TrendingUp,
    Globe, Clock,
} from 'lucide-react';

// ─── Mock Data ──────────────────────────────────────────────────
const performanceHistory = [
    { date: 'Mon', score: 85, scans: 12 },
    { date: 'Tue', score: 88, scans: 15 },
    { date: 'Wed', score: 92, scans: 18 },
    { date: 'Thu', score: 76, scans: 9 },
    { date: 'Fri', score: 89, scans: 22 },
    { date: 'Sat', score: 95, scans: 14 },
    { date: 'Sun', score: 94, scans: 16 },
];

const recentScans = [
    { id: '1', project: 'Marketing Site', url: 'marketing.acme.co', status: 'Pass', score: 98, time: '2 min ago' },
    { id: '2', project: 'API Docs', url: 'docs.acme.co', status: 'Pass', score: 91, time: '18 min ago' },
    { id: '3', project: 'Dashboard App', url: 'app.acme.co', status: 'Fail', score: 34, time: '1 hr ago' },
    { id: '4', project: 'E-commerce', url: 'shop.acme.co', status: 'Pass', score: 72, time: '3 hr ago' },
    { id: '5', project: 'Blog', url: 'blog.acme.co', status: 'Fail', score: 45, time: '5 hr ago' },
];

// ─── Helpers ────────────────────────────────────────────────────
function getScoreColor(score: number): string {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
}

function getScoreBg(score: number): string {
    if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
}

// ─── Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Overview</h1>
                <p className="text-sm text-slate-400 mt-1">Monitor your web performance across all projects.</p>
            </div>

            {/* ─── Stats Grid ─── */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Avg Performance"
                    value="88"
                    change="+2.5%"
                    changeLabel="from last week"
                    icon={<TrendingUp className="h-4 w-4" />}
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                />
                <StatCard
                    title="Total Scans"
                    value="1,248"
                    change="+12"
                    changeLabel="today"
                    icon={<Globe className="h-4 w-4" />}
                    iconColor="text-blue-400"
                    iconBg="bg-blue-500/10"
                />
                <StatCard
                    title="Critical Issues"
                    value="3"
                    change="2 unresolved"
                    changeLabel=""
                    icon={<AlertTriangle className="h-4 w-4" />}
                    iconColor="text-rose-400"
                    iconBg="bg-rose-500/10"
                />
                <StatCard
                    title="Uptime"
                    value="99.9%"
                    change="All monitors"
                    changeLabel="healthy"
                    icon={<Timer className="h-4 w-4" />}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-500/10"
                />
            </section>

            {/* ─── Chart + Recent Activity ─── */}
            <section className="grid gap-6 lg:grid-cols-7">
                {/* Performance Chart */}
                <Card className="lg:col-span-4 border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-slate-100">Performance Trend</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Average score across all projects — last 7 days
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                                Live
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceHistory}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#1e293b',
                                            borderRadius: '8px',
                                            color: '#f8fafc',
                                            fontSize: '13px',
                                        }}
                                        itemStyle={{ color: '#10b981' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                                        activeDot={{ r: 5, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-3 border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-100">Recent Activity</CardTitle>
                        <CardDescription className="text-slate-400">Latest audit results</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800/40 hover:border-slate-700/60 hover:bg-slate-800/30 transition-all duration-200 group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg border ${getScoreBg(scan.score)}`}>
                                            {scan.score >= 50 ? (
                                                <CheckCircle className={`w-4 h-4 ${getScoreColor(scan.score)}`} />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                                                {scan.project}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{scan.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        <span className={`text-lg font-bold tabular-nums ${getScoreColor(scan.score)}`}>
                                            {scan.score}
                                        </span>
                                        <div className="flex flex-col items-end">
                                            <Badge
                                                variant={scan.status === 'Pass' ? 'default' : 'destructive'}
                                                className={
                                                    scan.status === 'Pass'
                                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                                }
                                            >
                                                {scan.status}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {scan.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({
    title, value, change, changeLabel, icon, iconColor, iconBg,
}: {
    title: string;
    value: string;
    change: string;
    changeLabel: string;
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
}) {
    return (
        <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-900/60 hover:border-slate-700/60 transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${iconBg}`}>
                    <span className={iconColor}>{icon}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-100 tabular-nums">{value}</div>
                <p className="text-xs text-slate-500 mt-1.5">
                    <span className="text-emerald-400 font-medium">{change}</span>
                    {changeLabel && ` ${changeLabel}`}
                </p>
            </CardContent>
        </Card>
    );
}
