'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Database, Settings, FileText,
    Plus, LogOut, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddProjectModal } from '@/components/add-project-modal';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/projects', icon: Database, label: 'Projects' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { href: '/docs', icon: FileText, label: 'Docs' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
            {/* ─── Sidebar ─── */}
            <aside className="w-64 border-r border-slate-800/60 flex flex-col fixed inset-y-0 left-0 bg-slate-950/80 backdrop-blur-xl z-50">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800/60">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-100">
                            Perf-Patrol
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                    }`}
                            >
                                <item.icon
                                    className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                                        }`}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Worker Status */}
                <div className="p-4 border-t border-slate-800/60">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/40">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                        <span className="text-xs font-mono text-slate-400">
                            Worker: Active
                        </span>
                    </div>
                </div>
            </aside>

            {/* ─── Main Area ─── */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Organization</span>
                        <span className="text-slate-600">/</span>
                        <span className="font-medium text-slate-200">Acme Corp</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <AddProjectModal />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9 border border-slate-700">
                                        <AvatarImage src="/avatars/user.png" alt="User" />
                                        <AvatarFallback className="bg-slate-800 text-emerald-400 text-sm font-semibold">
                                            JD
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">John Doe</p>
                                        <p className="text-xs text-slate-400">john@example.com</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
