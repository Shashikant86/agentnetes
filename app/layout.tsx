import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentnetes — Zero to a Self-Organizing AI Agency. On Demand.',
  description: "Zero to Agent? We are taking it further. A self-organizing, recursive agent system — basically Kubernetes for AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
