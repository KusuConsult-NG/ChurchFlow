import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
export const metadata={ title:'ChurchFlow', description:'Server-first Next.js' };
export default async function RootLayout({ children }){
  const session=await getServerSession(authOptions); const user=session?.user;
  return (<html lang="en"><body className="min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ChurchFlow</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              <a href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Dashboard</a>
              <a href="/announcements" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Announcements</a>
              <a href="/giving" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Giving</a>
              <a href="/members" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Members</a>
              <a href="/events" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Events</a>
              <a href="/attendance" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Attendance</a>
              <a href="/fund-transfer" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Fund Transfer</a>
              <a href="/account-statements" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">Statements</a>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{user.name || user.email}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                
                {/* Role-specific dashboards */}
                <div className="flex items-center space-x-2">
                  {user.role==='ADMIN' && <a className="btn-secondary text-xs" href="/admin">Admin</a>}
                  {user.role==='AGENCY_LEADER' && <a className="btn-secondary text-xs" href="/agency-leader-dashboard">Agency</a>}
                  {user.role==='BANK_OPERATOR' && <a className="btn-secondary text-xs" href="/bank-financial-dashboard">Bank</a>}
                  {user.role==='DCC' && <a className="btn-secondary text-xs" href="/dcc-dashboard">DCC</a>}
                  {user.role==='GCC' && <a className="btn-secondary text-xs" href="/gcc-dashboard">GCC</a>}
                  {user.role==='LCC' && <a className="btn-secondary text-xs" href="/lcc-dashboard">LCC</a>}
                </div>

                <div className="flex items-center space-x-2">
                  <a href="/auth/2fa-setup" className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Security Settings">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </a>
                  <a href="/api/auth/signout" className="btn-secondary text-xs">Sign Out</a>
                </div>
              </div>
            ) : (
              <a href="/auth/login" className="btn-primary">Sign In</a>
            )}
          </div>
        </div>
      </div>
    </header>
    <main className="min-h-screen">
      {children}
    </main>
  </body></html>);
}
