import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity, AlertTriangle, CheckCircle, Timer, TrendingUp,
    Globe, Clock,
} from 'lucide-react';
import { prisma } from '@perf-patrol/database';
import { PerformanceChart } from '@/components/performance-chart';

export const dynamic = 'force-dynamic';

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return 'Just now';
}

function getScoreColor(score: number | null): string {
    if (score === null) return 'text-slate-500';
    if (score >= 90) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
}

function getScoreBg(score: number | null): string {
    if (score === null) return 'bg-slate-500/10 border-slate-500/20';
    if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
}

export default async function DashboardPage() {
    const totalScans = await prisma.auditResult.count();
    const criticalIssues = await prisma.auditResult.count({
        where: { score: { lt: 50 }, status: 'COMPLETED' },
    });

    const completedAudits = await prisma.auditResult.findMany({
        where: { status: 'COMPLETED', score: { not: null } },
        select: { score: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    });

    const avgScore = completedAudits.length > 0
        ? Math.round(completedAudits.reduce((acc: number, curr: { score: number | null }) => acc + (curr.score || 0), 0) / completedAudits.length)
        : 0;

    const recentScans = await prisma.auditResult.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: true },
    });

    const chartData = completedAudits.map((a: { createdAt: Date; score: number | null }) => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.score,
    })).slice(-20);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Overview</h1>
                <p className="text-sm text-slate-400 mt-1">Monitor your web performance across all projects.</p>
            </div>

            {/* Stats Grid */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Avg Performance" value={String(avgScore)} sub={avgScore > 0 ? 'Active' : 'No data'} icon={<TrendingUp className="h-4 w-4" />} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                <StatCard title="Total Scans" value={String(totalScans)} sub="All time" icon={<Globe className="h-4 w-4" />} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
                <StatCard title="Critical Issues" value={String(criticalIssues)} sub="Score < 50" icon={<AlertTriangle className="h-4 w-4" />} iconColor="text-rose-400" iconBg="bg-rose-500/10" />
                <StatCard title="Uptime" value="100%" sub="Operational" icon={<Timer className="h-4 w-4" />} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
            </section>

            {/* Chart + Activity */}
            <section className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-slate-100">Performance Trend</CardTitle>
                                <CardDescription className="text-slate-400">Last {chartData.length} audits</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                                Live
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2 h-[320px]">
                        <PerformanceChart data={chartData} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-100">Recent Activity</CardTitle>
                        <CardDescription className="text-slate-400">Latest audit results</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentScans.map((scan: any) => (
                                <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800/40 hover:border-slate-700/60 hover:bg-slate-800/30 transition-all duration-200 group cursor-pointer">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg border ${getScoreBg(scan.score)}`}>
                                            {(scan.score || 0) >= 50 ? <CheckCircle className={`w-4 h-4 ${getScoreColor(scan.score)}`} /> : scan.status === 'FAILED' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Activity className="w-4 h-4 text-blue-400 animate-pulse" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{scan.project.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{scan.project.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        {scan.score !== null && <span className={`text-lg font-bold tabular-nums ${getScoreColor(scan.score)}`}>{scan.score}</span>}
                                        <div className="flex flex-col items-end">
                                            <Badge variant={scan.status === 'COMPLETED' && (scan.score || 0) >= 50 ? 'default' : 'destructive'} className={scan.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : scan.status === 'PENDING' || scan.status === 'PROCESSING' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-rose-500/15 text-rose-400 border-rose-500/20'}>{scan.status}</Badge>
                                            <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(new Date(scan.createdAt))}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentScans.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No scans yet. Create a project to start.</div>}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function StatCard({ title, value, sub, icon, iconColor, iconBg }: {
    title: string; value: string; sub: string;
    icon: React.ReactNode; iconColor: string; iconBg: string;
}) {
    return (
        <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-900/60 hover:border-slate-700/60 transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${iconBg}`}><span className={iconColor}>{icon}</span></div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-100 tabular-nums">{value}</div>
                <p className="text-xs text-slate-500 mt-1.5"><span className="text-emerald-400 font-medium">{sub}</span></p>
            </CardContent>
        </Card>
    );
}
