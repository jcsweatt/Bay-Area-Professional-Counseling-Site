import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bay Area Professional Counseling',
  description: 'Private redesign previews for Bay Area Professional Counseling.',
  icons: { icon: '/assets/bay-area-favicon-64.png' },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
