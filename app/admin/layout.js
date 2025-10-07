export default function AdminLayout({ children }) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-4'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              Administration Panel
            </h1>
            <nav className='flex flex-wrap gap-2'>
              <a
                href='/admin'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Announcements
              </a>
              <a
                href='/admin/projects'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Projects
              </a>
              <a
                href='/admin/requisitions'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Requisitions
              </a>
              <a
                href='/admin/accounts'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Accounts
              </a>
              <a
                href='/admin/transactions'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Transactions
              </a>
              <a
                href='/admin/bank-reconciliation'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Bank Reconciliation
              </a>
              <a
                href='/admin/annual-budget-planning'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Budget Planning
              </a>
              <a
                href='/admin/executive-financial-analytics'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Financial Analytics
              </a>
              <a
                href='/admin/approval-workflows'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Approval Workflows
              </a>
              <a
                href='/account-statements'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Account Statements
              </a>
              <a
                href='/admin/data-export'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Data Export
              </a>
              <a
                href='/admin/notifications'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Notifications
              </a>
              <a
                href='/compliance-monitoring'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Compliance
              </a>
              <a
                href='/admin/hr-reports'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                HR Reports
              </a>
              <a
                href='/admin/leave-management'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Leave Management
              </a>
              <a
                href='/admin/uploads'
                className='px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors'
              >
                Uploads
              </a>
            </nav>
          </div>
        </div>
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </div>
    </div>
  );
}
