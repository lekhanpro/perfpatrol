import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Perf-Patrol — Automated Lighthouse Audits',
    description: 'A distributed platform for continuous web performance monitoring using Google Lighthouse.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="antialiased">{children}</body>
        </html>
    );
}
