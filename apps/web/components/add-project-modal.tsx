'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Zap } from 'lucide-react';

export function AddProjectModal() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = {
            name: formData.get('name') as string,
            url: formData.get('url') as string,
            frequency: formData.get('frequency') as string,
        };

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: data.url, projectId: 'new' }),
            });

            if (!res.ok) throw new Error('Failed to create project');

            setOpen(false);
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/10 transition-all hover:shadow-emerald-500/20 gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        Add New Project
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Start monitoring a website. We&apos;ll run the first audit immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">Project Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="My Awesome Site"
                            className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url" className="text-slate-300">URL to Monitor</Label>
                        <Input
                            id="url"
                            name="url"
                            type="url"
                            placeholder="https://example.com"
                            className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-slate-300">Scan Frequency</Label>
                        <Select name="frequency" defaultValue="daily">
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
