'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AnnualBudgetPlanning() {
  const { data: session } = useSession();
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    category: '',
    allocatedAmount: '',
    description: '',
    department: ''
  });

  useEffect(() => {
    fetchBudgets();
  }, [selectedYear]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budget?year=${selectedYear}`);
      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          year: new Date().getFullYear(),
          category: '',
          allocatedAmount: '',
          description: '',
          department: ''
        });
        fetchBudgets();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create budget');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0);
  const remaining = totalAllocated - totalSpent;

  const budgetCategories = [
    'Ministry Operations',
    'Building & Maintenance',
    'Mission & Outreach',
    'Administrative',
    'Technology',
    'Emergency Fund',
    'Special Projects',
    'Staff & Personnel'
  ];

  const departments = [
    'General Administration',
    'Finance',
    'Ministry',
    'Mission',
    'Youth',
    'Children',
    'Women',
    'Men',
    'Elderly'
  ];

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading budget data...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Annual Budget Planning</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Budget Item
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Allocated</p>
              <p className="text-2xl font-semibold text-gray-900">${totalAllocated.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${remaining >= 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
              <svg className={`w-6 h-6 ${remaining >= 0 ? 'text-green-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-semibold ${remaining >= 0 ? 'text-gray-900' : 'text-orange-600'}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Items for {selectedYear}</h2>
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-500">{budget.department}</p>
                      <p className="text-sm text-gray-600">{budget.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Allocated: <span className="font-medium">${budget.allocatedAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Spent: <span className="font-medium">${(budget.spentAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    Remaining: <span className={`font-medium ${(budget.allocatedAmount - (budget.spentAmount || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(budget.allocatedAmount - (budget.spentAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Budget Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Budget Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {budgetCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount</label>
                <input
                  type="number"
                  name="allocatedAmount"
                  value={formData.allocatedAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 px-4 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Budget Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
