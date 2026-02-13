import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { prisma, JobStatus } from '@perf-patrol/database';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Lazy queue initialization
let auditQueue: Queue | null = null;
function getQueue(): Queue {
    if (!auditQueue) {
        auditQueue = new Queue('audit-queue', {
            connection: { url: REDIS_URL },
        });
    }
    return auditQueue;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { url, projectId, name, frequency } = body;

        // 1. Validation
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Missing url' }, { status: 400 });
        }

        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // 2. Handle New Project Creation
        if (projectId === 'new') {
            if (!name) name = new URL(url).hostname;
            const project = await prisma.project.create({
                data: {
                    name,
                    url,
                    frequency: frequency || 'daily',
                },
            });
            projectId = project.id;
        }

        if (!projectId) {
            return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
        }

        // 3. Create PENDING audit record
        const audit = await prisma.auditResult.create({
            data: {
                projectId,
                status: JobStatus.PENDING,
                // score is unnecessary here, defaults to null
            },
        });

        // 4. Add to Queue with auditId
        const queue = getQueue();
        await queue.add('audit', {
            url,
            projectId,
            auditId: audit.id,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Scan queued',
            auditId: audit.id,
            projectId,
        });
    } catch (error) {
        console.error('[API] /api/scan error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
