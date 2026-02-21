import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Clock, TrendingUp, ArrowUpRight, BarChart3 } from 'lucide-react';
import { prisma } from '@perf-patrol/database';

export const dynamic = 'force-dynamic';

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return 'Just now';
}

function getScoreColor(score: number): string {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
}

function getScoreBadge(score: number): string {
    if (score >= 90) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
}

function getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Critical';
}

export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        include: {
            audits: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    score: true,
                    status: true,
                    createdAt: true,
                },
            },
            _count: { select: { audits: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Projects</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {projects.length} project{projects.length !== 1 ? 's' : ''} being monitored
                    </p>
                </div>
            </div>

            {projects.length === 0 ? (
                <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BarChart3 className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-lg font-medium text-slate-300">No projects yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Click &quot;New Project&quot; to start monitoring a website.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => {
                        const latestAudit = project.audits[0];
                        const latestScore = latestAudit?.score ?? null;
                        const completedAudits = project.audits.filter(
                            (a: { score: number | null }) => a.score !== null
                        );
                        const avgScore = completedAudits.length > 0
                            ? Math.round(
                                completedAudits.reduce(
                                    (acc: number, a: { score: number | null }) => acc + (a.score || 0), 0
                                ) / completedAudits.length
                            )
                            : null;

                        return (
                            <Card
                                key={project.id}
                                className="border-slate-800/60 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-900/60 hover:border-slate-700/60 transition-all duration-200 cursor-pointer group"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                                                {project.name}
                                            </CardTitle>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                                                <span className="text-xs text-slate-500 truncate">
                                                    {project.url}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 ml-2" />
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Latest Score */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {latestScore !== null ? (
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className={`text-3xl font-bold tabular-nums ${getScoreColor(latestScore)}`}>
                                                        {latestScore}
                                                    </span>
                                                    <span className="text-sm text-slate-500">/100</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-500">No scores yet</span>
                                            )}
                                        </div>
                                        {latestScore !== null && (
                                            <Badge className={getScoreBadge(latestScore)}>
                                                {getScoreLabel(latestScore)}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Mini Score Bar */}
                                    {completedAudits.length > 1 && (
                                        <div className="flex items-end gap-0.5 h-8">
                                            {completedAudits.slice(-8).map((audit: { id: string; score: number | null }, i: number) => {
                                                const score = audit.score || 0;
                                                const height = Math.max((score / 100) * 100, 10);
                                                const color = score >= 90
                                                    ? 'bg-emerald-500'
                                                    : score >= 50
                                                        ? 'bg-amber-500'
                                                        : 'bg-rose-500';
                                                return (
                                                    <div
                                                        key={audit.id}
                                                        className={`flex-1 rounded-sm ${color} opacity-60 group-hover:opacity-100 transition-opacity`}
                                                        style={{ height: `${height}%` }}
                                                        title={`Score: ${score}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Footer Meta */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>{project._count.audits} scans</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {latestAudit
                                                    ? timeAgo(new Date(latestAudit.createdAt))
                                                    : 'Never'}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-slate-700 text-slate-400">
                                            {project.frequency}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
