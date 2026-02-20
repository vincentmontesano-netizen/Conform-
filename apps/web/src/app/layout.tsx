import type { Metadata } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const displayFont = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CONFORM+ | Conformite reglementaire',
  description: 'Plateforme SaaS de conformite reglementaire et prevention des risques',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-body">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
