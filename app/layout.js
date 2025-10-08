import './globals.css';
import AuthWrapper from '../components/AuthWrapper';

import Providers from './providers';

export const metadata = {
  title: 'ChurchFlow',
  description: 'Server-first Next.js'
};

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='min-h-screen bg-gray-50'>
        <Providers>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}