import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function BankReconciliation() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !['BANK_OPERATOR', 'ADMIN'].includes(session.user.role)) {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Access Denied</h2>
          <p className="text-red-700 text-sm">You don't have permission to access this page.</p>
        </div>
      </main>
    );
  }

  // Fetch reconciliation data
  const [accounts, pendingTransactions, reconciledTransactions] = await Promise.all([
    prisma.accountBook.findMany({
      select: { id: true, name: true, balance: true, accountType: true }
    }),
    prisma.transaction.findMany({
      where: { status: 'PENDING' },
      include: { book: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      include: { book: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bank Reconciliation</h1>
        <div className="text-sm text-gray-600">
          Bank Operator: {session.user.name}
        </div>
      </div>

      {/* Account Balances */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.accountType}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${account.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Transactions</h2>
        <div className="space-y-3">
          {pendingTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.book.name} • {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'DEPOSIT' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <form action={`/api/transaction/${transaction.id}/approve`} method="post" className="inline">
                    <button 
                      type="submit"
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={`/api/transaction/${transaction.id}/reject`} method="post" className="inline">
                    <button 
                      type="submit"
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reconciled Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reconciled Transactions</h2>
        <div className="space-y-3">
          {reconciledTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                <p className="text-xs text-gray-500">
                  {transaction.book.name} • {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'DEPOSIT' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Reconciled
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reconciliation Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reconciliation Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div className="font-medium text-blue-900">Import Bank Statement</div>
            <div className="text-sm text-blue-700">Upload CSV file for reconciliation</div>
          </button>
          <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <div className="font-medium text-green-900">Generate Report</div>
            <div className="text-sm text-green-700">Create reconciliation report</div>
          </button>
          <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <div className="font-medium text-purple-900">Export Data</div>
            <div className="text-sm text-purple-700">Export transaction data</div>
          </button>
        </div>
      </div>
    </main>
  );
}
