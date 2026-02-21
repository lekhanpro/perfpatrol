import { Worker, Job } from 'bullmq';
import puppeteer, { Browser } from 'puppeteer';
import { PrismaClient, JobStatus } from '@prisma/client';

// ─── Configuration ───────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY) || 2;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 5;
const RATE_LIMIT_DURATION = Number(process.env.RATE_LIMIT_DURATION) || 60_000;

const prisma = new PrismaClient();

interface AuditJobData {
    url: string;
    projectId: string;
    auditId: string;
}

// ─── Worker ──────────────────────────────────────────────────────
console.log('🚀 Perf-Patrol Worker starting...');
console.log(`📡 Redis: ${REDIS_URL}`);
console.log(`⚙️  Concurrency: ${CONCURRENCY} | Rate: ${RATE_LIMIT_MAX} jobs / ${RATE_LIMIT_DURATION}ms`);

const worker = new Worker<AuditJobData>(
    'audit-queue',
    async (job: Job<AuditJobData>) => {
        const { url, projectId, auditId } = job.data;
        console.log(`\n📋 Job ${job.id} | URL: ${url} | Audit: ${auditId}`);

        if (!auditId) {
            throw new Error('Missing auditId in job data');
        }

        // Mark as processing
        await prisma.auditResult.update({
            where: { id: auditId },
            data: { status: JobStatus.PROCESSING },
        }).catch((e) => {
            console.error(`Failed to mark audit ${auditId} as PROCESSING:`, e);
        });

        let browser: Browser | null = null;

        try {
            browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ],
                headless: true,
            });

            // Dynamic import for lighthouse (ESM)
            const lighthouse = (await import('lighthouse')).default;
            const { port } = new URL(browser.wsEndpoint());

            const runnerResult = await lighthouse(url, {
                port: Number(port),
                output: 'json',
                onlyCategories: ['performance'],
                logLevel: 'error',
            });

            if (!runnerResult?.lhr) {
                throw new Error('Lighthouse returned no result');
            }

            const reportJson = runnerResult.lhr;
            const rawScore = reportJson.categories?.performance?.score;
            const score = rawScore != null ? Math.round(rawScore * 100) : 0;

            await prisma.auditResult.update({
                where: { id: auditId },
                data: {
                    status: JobStatus.COMPLETED,
                    score,
                    reportJson: reportJson as any,
                },
            });

            console.log(`✅ Complete | ${url} | Score: ${score}/100`);
            return { score, url };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`❌ Job ${job.id} failed:`, errorMsg);

            await prisma.auditResult.update({
                where: { id: auditId },
                data: { status: JobStatus.FAILED, errorMsg },
            }).catch((e) => console.error('Failed to update failure status:', e));

            throw error;
        } finally {
            if (browser) await browser.close();
        }
    },
    {
        connection: { url: REDIS_URL },
        concurrency: CONCURRENCY,
        limiter: { max: RATE_LIMIT_MAX, duration: RATE_LIMIT_DURATION },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
);

// ─── Event Handlers ──────────────────────────────────────────────
worker.on('completed', (job) => {
    console.log(`🎉 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`💥 Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});

worker.on('error', (err) => {
    console.error('⚠️  Worker error:', err);
});

// ─── Graceful Shutdown ───────────────────────────────────────────
const shutdown = async (): Promise<void> => {
    console.log('\n🛑 Shutting down worker...');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('✅ Worker ready — listening on "audit-queue"');
