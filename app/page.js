'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Handle login
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          router.push('/dashboard');
        } else {
          const data = await response.json();
          setError(data.error || 'Login failed');
        }
      } else {
        // Handle signup
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        });

        if (response.ok) {
          setError('');
          alert('Registration successful! Please check your email to verify your account.');
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'MEMBER' });
          setShowAuthForm(false);
        } else {
          const data = await response.json();
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ChurchFlow
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive Church Management System
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => { setIsLogin(true); setShowAuthForm(true); }}
              className="btn-primary px-8 py-3 text-lg"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setShowAuthForm(true); }}
              className="btn-secondary px-8 py-3 text-lg"
            >
              Sign Up
            </button>
            <Link 
              href="/admin" 
              className="btn-secondary px-8 py-3 text-lg"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card p-6">
            <div className="text-3xl text-blue-600 mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Member Management</h3>
            <p className="text-gray-600">
              Manage church members, attendance, and member information efficiently.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-3xl text-green-600 mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Financial Management</h3>
            <p className="text-gray-600">
              Track offerings, tithes, expenses, and generate financial reports.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-3xl text-purple-600 mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Event Management</h3>
            <p className="text-gray-600">
              Schedule and manage church events, services, and special occasions.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-3xl text-orange-600 mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">
              Generate comprehensive reports and analytics for better decision making.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-3xl text-red-600 mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Security & Compliance</h3>
            <p className="text-gray-600">
              Ensure data security and compliance with church management standards.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-3xl text-indigo-600 mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mobile Ready</h3>
            <p className="text-gray-600">
              Access your church management system from any device, anywhere.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of churches already using ChurchFlow to manage their operations.
          </p>
          <button 
            onClick={() => { setIsLogin(false); setShowAuthForm(true); }}
            className="btn-primary px-12 py-4 text-xl"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? 'Sign In to Your Account' : 'Create Your Account'}
                </h2>
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        required={!isLogin}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="AGENCY_LEADER">Agency Leader</option>
                        <option value="BANK_OPERATOR">Bank Operator</option>
                        <option value="DCC">DCC</option>
                        <option value="GCC">GCC</option>
                        <option value="LCC">LCC</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
