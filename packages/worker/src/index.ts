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
}

// ─── Worker ──────────────────────────────────────────────────────
console.log('🚀 Perf-Patrol Worker starting...');
console.log(`📡 Connecting to Redis: ${REDIS_URL}`);

const worker = new Worker<AuditJobData>(
    'audit-queue',
    async (job: Job<AuditJobData>) => {
        const { url, projectId } = job.data;
        console.log(`\n📋 Processing job ${job.id} | URL: ${url}`);

        // Mark as processing
        await prisma.auditResult.update({
            where: { id: job.data.projectId },
            data: { status: JobStatus.PROCESSING },
        }).catch(() => {
            // Audit result may not exist yet — create it
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

            // Save to database
            await prisma.auditResult.create({
                data: {
                    projectId,
                    status: JobStatus.COMPLETED,
                    score,
                    reportJson: reportJson as any,
                },
            });

            console.log(`✅ Audit complete | ${url} | Score: ${score}/100`);
            return { score, url };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`❌ Job ${job.id} failed:`, errorMsg);

            // Save failure to DB
            await prisma.auditResult.create({
                data: {
                    projectId,
                    status: JobStatus.FAILED,
                    score: null,
                    reportJson: null,
                    errorMsg,
                },
            });

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
