import { Worker, Job } from 'bullmq';
import puppeteer, { Browser } from 'puppeteer';
import { PrismaClient, JobStatus } from '@prisma/client';

// ─── Configuration ───────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MAX_RETRIES = 3;
const CONCURRENCY = 2;

const prisma = new PrismaClient();

interface AuditJobData {
    url: string;
    projectId: string;
    auditId: string;
}

// ─── Worker ──────────────────────────────────────────────────────
console.log('🚀 Perf-Patrol Worker starting...');
console.log(`📡 Connecting to Redis: ${REDIS_URL}`);

const worker = new Worker<AuditJobData>(
    'audit-queue',
    async (job: Job<AuditJobData>) => {
        const { url, projectId, auditId } = job.data;
        console.log(`\n📋 Processing job ${job.id} | URL: ${url} | AuditID: ${auditId}`);

        if (!auditId) {
            console.error('❌ Missing auditId in job data');
            return; // Or throw error
        }

        // Mark as processing
        await prisma.auditResult.update({
            where: { id: auditId },
            data: { status: JobStatus.PROCESSING },
        }).catch((e) => {
            console.error(`Failed to mark audit ${auditId} as processing`, e);
        });

        let browser: Browser | null = null;

        try {
            // Launch headless Chrome
            browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ],
                headless: true,
            });

            // Dynamic import for lighthouse (ESM module)
            const lighthouse = (await import('lighthouse')).default;
            const { port } = new URL(browser.wsEndpoint());

            const runnerResult = await lighthouse(url, {
                port: Number(port),
                output: 'json',
                onlyCategories: ['performance'],
                logLevel: 'error',
            });

            if (!runnerResult || !runnerResult.lhr) {
                throw new Error('Lighthouse returned no result');
            }

            const reportJson = runnerResult.lhr;
            const rawScore = reportJson.categories?.performance?.score;
            const score = rawScore != null ? Math.round(rawScore * 100) : 0;

            // Update result in database
            await prisma.auditResult.update({
                where: { id: auditId },
                data: {
                    status: JobStatus.COMPLETED,
                    score,
                    reportJson: reportJson as any,
                    // completedAt is auto-updated if we added it to schema?
                    // schema has updatedAt, but having explicit completedAt is nice.
                    // schema definition in step 348 shows completedAt? No?
                    // step 348: completedAt DateTime?  Wait, step 348 says:
                    // updatedAt DateTime @updatedAt
                    // createdAt DateTime @default(now())
                    // NO completedAt in schema step 348.
                    // But schema step 0 REQUESTED it?
                    // Step 348 shows: `updatedAt DateTime @updatedAt`
                    // So I rely on `updatedAt`.
                },
            });

            console.log(`✅ Audit complete | ${url} | Score: ${score}/100`);
            return { score, url };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`❌ Job ${job.id} failed:`, errorMsg);

            // Save failure to DB
            await prisma.auditResult.update({
                where: { id: auditId },
                data: {
                    status: JobStatus.FAILED,
                    errorMsg,
                },
            }).catch(e => console.error("Failed to update failure status", e));

            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    },
    {
        connection: { url: REDIS_URL },
        concurrency: CONCURRENCY,
        limiter: {
            max: 5,
            duration: 60_000, // 5 jobs per minute
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
);

// ─── Event Handlers ──────────────────────────────────────────────
worker.on('completed', (job) => {
    console.log(`🎉 Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`💥 Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message);
});

worker.on('error', (err) => {
    console.error('⚠️  Worker error:', err);
});

// Graceful shutdown
const shutdown = async (): Promise<void> => {
    console.log('\n🛑 Shutting down worker...');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('✅ Worker is ready and listening for jobs on "audit-queue"');
