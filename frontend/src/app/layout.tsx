import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Asah Kemampuan — Platform Tryout Online',
  description: 'Platform tryout online terbaik untuk persiapan ujian. Latihan soal lengkap, analisis hasil, dan leaderboard real-time.',
  keywords: 'tryout online, latihan soal, ujian online, CPNS, SKD, UTBK, persiapan ujian',
  openGraph: {
    title: 'Asah Kemampuan — Platform Tryout Online',
    description: 'Platform tryout online terbaik untuk persiapan ujian.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.className}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f8fafc' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            },
          }}
        />
      </body>
    </html>
  );
}

