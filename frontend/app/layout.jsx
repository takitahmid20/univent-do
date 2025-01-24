import { Roboto } from 'next/font/google';
import '@/styles/globals.css';
import ClientWrapper from '@/components/ClientWrapper';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'Univent',
  description: 'Scan, Check-In, Connect with Univent',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}