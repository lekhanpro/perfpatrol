import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let auditQueue: Queue | null = null;

function getQueue(): Queue {
    if (!auditQueue) {
        auditQueue = new Queue('audit-queue', {
            connection: { url: REDIS_URL },
        });
    }
    return auditQueue;
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { url, projectId } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "url" field' },
                { status: 400 },
            );
        }

        if (!projectId || typeof projectId !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "projectId" field' },
                { status: 400 },
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 },
            );
        }

        const queue = getQueue();
        const job = await queue.add('audit', { url, projectId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });

        return NextResponse.json({
            success: true,
            message: 'Scan queued successfully',
            jobId: job.id,
        });
    } catch (error) {
        console.error('[API] /api/scan error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
