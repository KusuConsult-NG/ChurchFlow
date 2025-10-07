'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Handle login with NextAuth
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.push('/dashboard');
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
          // Auto-signin after successful registration
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
          });

          if (result?.error) {
            setError('Registration successful, but auto-login failed. Please sign in manually.');
          } else {
            router.push('/dashboard');
          }
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>ChurchFlow</h1>
          <p className='text-xl text-gray-600 mb-8'>
            Comprehensive Church Management System
          </p>
          <div className='flex justify-center gap-4'>
            <button
              onClick={() => {
                setIsLogin(true);
                setShowAuthForm(true);
              }}
              className='btn-primary px-8 py-3 text-lg'
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setShowAuthForm(true);
              }}
              className='btn-secondary px-8 py-3 text-lg'
            >
              Sign Up
            </button>
            <Link href='/admin' className='btn-secondary px-8 py-3 text-lg'>
              Admin Panel
            </Link>
          </div>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          <div className='card p-6'>
            <div className='text-3xl text-blue-600 mb-4'>👥</div>
            <h3 className='text-xl font-semibold mb-2'>Member Management</h3>
            <p className='text-gray-600'>
              Manage church members, attendance, and member information
              efficiently.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl text-green-600 mb-4'>💰</div>
            <h3 className='text-xl font-semibold mb-2'>Financial Management</h3>
            <p className='text-gray-600'>
              Track offerings, tithes, expenses, and generate financial reports.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl text-purple-600 mb-4'>📅</div>
            <h3 className='text-xl font-semibold mb-2'>Event Management</h3>
            <p className='text-gray-600'>
              Schedule and manage church events, services, and special
              occasions.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl text-orange-600 mb-4'>📊</div>
            <h3 className='text-xl font-semibold mb-2'>Analytics & Reports</h3>
            <p className='text-gray-600'>
              Generate comprehensive reports and analytics for better decision
              making.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl text-red-600 mb-4'>🔒</div>
            <h3 className='text-xl font-semibold mb-2'>
              Security & Compliance
            </h3>
            <p className='text-gray-600'>
              Ensure data security and compliance with church management
              standards.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl text-indigo-600 mb-4'>📱</div>
            <h3 className='text-xl font-semibold mb-2'>Mobile Ready</h3>
            <p className='text-gray-600'>
              Access your church management system from any device, anywhere.
            </p>
          </div>
        </div>

        <div className='text-center mt-16'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            Ready to Get Started?
          </h2>
          <p className='text-lg text-gray-600 mb-8'>
            Join thousands of churches already using ChurchFlow to manage their
            operations.
          </p>
          <button
            onClick={() => {
              setIsLogin(false);
              setShowAuthForm(true);
            }}
            className='btn-primary px-12 py-4 text-xl'
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {isLogin ? 'Sign In to Your Account' : 'Create Your Account'}
                </h2>
                <button
                  onClick={() => setShowAuthForm(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                {!isLogin && (
                  <div>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Full Name
                    </label>
                    <input
                      type='text'
                      name='name'
                      id='name'
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Email Address
                  </label>
                  <input
                    type='email'
                    name='email'
                    id='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <div className='mt-1 relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      id='password'
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className='block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    >
                      {showPassword ? (
                        <svg
                          className='h-5 w-5 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='h-5 w-5 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label
                        htmlFor='confirmPassword'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Confirm Password
                      </label>
                      <div className='mt-1 relative'>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name='confirmPassword'
                          id='confirmPassword'
                          required={!isLogin}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className='block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                        >
                          {showConfirmPassword ? (
                            <svg
                              className='h-5 w-5 text-gray-400'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                              />
                            </svg>
                          ) : (
                            <svg
                              className='h-5 w-5 text-gray-400'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor='role'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Role
                      </label>
                      <select
                        name='role'
                        id='role'
                        value={formData.role}
                        onChange={handleChange}
                        className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      >
                        <option value='MEMBER'>Member</option>
                        <option value='ADMIN'>Administrator</option>
                        <option value='AGENCY_LEADER'>Agency Leader</option>
                        <option value='BANK_OPERATOR'>Bank Operator</option>
                        <option value='DCC'>DCC</option>
                        <option value='GCC'>GCC</option>
                        <option value='LCC'>LCC</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoading
                      ? 'Processing...'
                      : isLogin
                        ? 'Sign In'
                        : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className='mt-6'>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-300' />
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-white text-gray-500'>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className='mt-6'>
                  <button
                    type='button'
                    onClick={() =>
                      signIn('google', { callbackUrl: '/dashboard' })
                    }
                    className='w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className='mt-4'>
                  <button
                    type='button'
                    onClick={() => setIsLogin(!isLogin)}
                    className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    {isLogin
                      ? 'Need an account? Sign up'
                      : 'Already have an account? Sign in'}
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
