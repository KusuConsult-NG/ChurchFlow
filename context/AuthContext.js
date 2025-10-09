'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          console.log('✅ User authenticated:', JSON.parse(storedUser).email);
        } else {
          setUser(null);
          console.log('❌ No user found in localStorage');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔍 Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔍 Login response:', data);

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        
        console.log('✅ Login successful, redirecting to dashboard');
        router.push('/dashboard');
        return { success: true };
      } else {
        console.log('❌ Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('🔍 Attempting signup for:', userData.email);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('🔍 Signup response:', data);

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        
        console.log('✅ Signup successful, redirecting to dashboard');
        router.push('/dashboard');
        return { success: true };
      } else {
        console.log('❌ Signup failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

