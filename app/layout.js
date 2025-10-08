import './globals.css';

import AuthGuard from '../components/AuthGuard';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'ChurchFlow',
  description: 'Church Management System'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}