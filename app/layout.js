import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: 'normal',
});

export const metadata = {
  title: 'Revive Design & Renovation — Renovation Estimator',
  description:
    'An instant ballpark renovation cost estimate from Revive Design & Renovation. Serving Tampa Bay and Orlando, Florida.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF8F3',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
