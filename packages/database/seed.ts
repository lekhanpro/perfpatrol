import { PrismaClient, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('🌱 Seeding database...');

    // Create demo projects
    const google = await prisma.project.upsert({
        where: { id: 'seed-project-google' },
        update: {},
        create: {
            id: 'seed-project-google',
            name: 'Google',
            url: 'https://google.com',
            frequency: 'daily',
        },
    });

    const github = await prisma.project.upsert({
        where: { id: 'seed-project-github' },
        update: {},
        create: {
            id: 'seed-project-github',
            name: 'GitHub',
            url: 'https://github.com',
            frequency: 'weekly',
        },
    });

    const vercel = await prisma.project.upsert({
        where: { id: 'seed-project-vercel' },
        update: {},
        create: {
            id: 'seed-project-vercel',
            name: 'Vercel',
            url: 'https://vercel.com',
            frequency: 'daily',
        },
    });

    // Create demo audit results (last 7 days)
    const now = new Date();
    const demoScores = [
        { project: google, scores: [92, 88, 95, 90, 87, 93, 91] },
        { project: github, scores: [85, 82, 88, 84, 86, 89, 87] },
        { project: vercel, scores: [97, 95, 98, 96, 94, 99, 97] },
    ];

    for (const { project, scores } of demoScores) {
        for (let i = 0; i < scores.length; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));

            await prisma.auditResult.create({
                data: {
                    projectId: project.id,
                    status: JobStatus.COMPLETED,
                    score: scores[i],
                    reportJson: {
                        categories: {
                            performance: { score: scores[i] / 100 },
                        },
                        audits: {
                            'first-contentful-paint': { numericValue: 1200 + Math.random() * 800 },
                            'largest-contentful-paint': { numericValue: 2000 + Math.random() * 1500 },
                            'total-blocking-time': { numericValue: 100 + Math.random() * 200 },
                            'cumulative-layout-shift': { numericValue: Math.random() * 0.15 },
                            'speed-index': { numericValue: 2500 + Math.random() * 1500 },
                        },
                    },
                    createdAt: date,
                },
            });
        }
    }

    console.log(`✅ Seeded ${demoScores.length} projects with 7 days of audit history each.`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
