// components/theme/ThemeProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemTheme, setSystemTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect system theme preference
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = e => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mounted]);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(systemTheme);
    }
  }, [systemTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLightTheme = () => {
    setTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
  };

  const setSystemThemeHandler = () => {
    setTheme(systemTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        systemTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme: setSystemThemeHandler
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme toggle button component
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
          />
        </svg>
      ) : (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      )}
    </button>
  );
};

// Theme selector component
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        Theme
      </h3>
      <div className='space-y-1'>
        <label className='flex items-center'>
          <input
            type='radio'
            name='theme'
            value='light'
            checked={theme === 'light'}
            onChange={setLightTheme}
            className='mr-2'
          />
          <span className='text-sm text-gray-700 dark:text-gray-300'>
            Light
          </span>
        </label>
        <label className='flex items-center'>
          <input
            type='radio'
            name='theme'
            value='dark'
            checked={theme === 'dark'}
            onChange={setDarkTheme}
            className='mr-2'
          />
          <span className='text-sm text-gray-700 dark:text-gray-300'>Dark</span>
        </label>
        <label className='flex items-center'>
          <input
            type='radio'
            name='theme'
            value='system'
            checked={theme === 'system'}
            onChange={setSystemTheme}
            className='mr-2'
          />
          <span className='text-sm text-gray-700 dark:text-gray-300'>
            System
          </span>
        </label>
      </div>
    </div>
  );
};

// Dark mode styles component
export const DarkModeStyles = () => {
  return (
    <style jsx global>{`
      /* Dark mode styles */
      .dark {
        --bg-primary: #1f2937;
        --bg-secondary: #374151;
        --bg-tertiary: #4b5563;
        --text-primary: #f9fafb;
        --text-secondary: #d1d5db;
        --text-tertiary: #9ca3af;
        --border-primary: #374151;
        --border-secondary: #4b5563;
        --accent-primary: #3b82f6;
        --accent-secondary: #1d4ed8;
      }

      /* High contrast mode */
      .high-contrast {
        --bg-primary: #000000;
        --bg-secondary: #ffffff;
        --text-primary: #ffffff;
        --text-secondary: #000000;
        --border-primary: #ffffff;
        --accent-primary: #ffff00;
      }

      /* Reduce motion */
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      /* Focus visible */
      .focus-visible *:focus {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
      }

      /* Dark mode component styles */
      .dark .bg-white {
        background-color: var(--bg-primary);
      }

      .dark .bg-gray-50 {
        background-color: var(--bg-secondary);
      }

      .dark .bg-gray-100 {
        background-color: var(--bg-tertiary);
      }

      .dark .text-gray-900 {
        color: var(--text-primary);
      }

      .dark .text-gray-700 {
        color: var(--text-secondary);
      }

      .dark .text-gray-600 {
        color: var(--text-tertiary);
      }

      .dark .border-gray-200 {
        border-color: var(--border-primary);
      }

      .dark .border-gray-300 {
        border-color: var(--border-secondary);
      }

      /* Dark mode form styles */
      .dark .form-input {
        background-color: var(--bg-secondary);
        border-color: var(--border-primary);
        color: var(--text-primary);
      }

      .dark .form-input:focus {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      /* Dark mode button styles */
      .dark .btn-primary {
        background-color: var(--accent-primary);
        color: white;
      }

      .dark .btn-primary:hover {
        background-color: var(--accent-secondary);
      }

      .dark .btn-secondary {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border-color: var(--border-primary);
      }

      .dark .btn-secondary:hover {
        background-color: var(--bg-tertiary);
      }

      /* Dark mode card styles */
      .dark .card {
        background-color: var(--bg-primary);
        border-color: var(--border-primary);
      }

      /* Dark mode table styles */
      .dark .table-header {
        background-color: var(--bg-secondary);
      }

      .dark .table-row:hover {
        background-color: var(--bg-tertiary);
      }

      /* Dark mode navigation styles */
      .dark .nav-item {
        color: var(--text-secondary);
      }

      .dark .nav-item:hover {
        color: var(--text-primary);
        background-color: var(--bg-secondary);
      }

      .dark .nav-item.active {
        color: var(--accent-primary);
        background-color: var(--bg-secondary);
      }

      /* Dark mode modal styles */
      .dark .modal-overlay {
        background-color: rgba(0, 0, 0, 0.8);
      }

      .dark .modal-content {
        background-color: var(--bg-primary);
        border-color: var(--border-primary);
      }

      /* Dark mode toast styles */
      .dark .toast-success {
        background-color: #065f46;
        color: #d1fae5;
        border-color: #047857;
      }

      .dark .toast-error {
        background-color: #7f1d1d;
        color: #fecaca;
        border-color: #dc2626;
      }

      .dark .toast-warning {
        background-color: #78350f;
        color: #fde68a;
        border-color: #d97706;
      }

      .dark .toast-info {
        background-color: #1e3a8a;
        color: #dbeafe;
        border-color: #2563eb;
      }
    `}</style>
  );
};

// Theme-aware component wrapper
export const ThemeAware = ({
  children,
  lightClassName = '',
  darkClassName = ''
}) => {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? darkClassName : lightClassName}`}>
      {children}
    </div>
  );
};

// Theme utilities
export const themeUtils = {
  // Get theme-aware class names
  getThemeClasses: (lightClasses, darkClasses) => {
    return `${lightClasses} dark:${darkClasses}`;
  },

  // Check if dark mode is active
  isDarkMode: () => {
    return document.documentElement.classList.contains('dark');
  },

  // Get system theme preference
  getSystemTheme: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  },

  // Apply theme to element
  applyTheme: (element, theme) => {
    if (theme === 'dark') {
      element.classList.add('dark');
    } else {
      element.classList.remove('dark');
    }
  },

  // Get theme-aware color
  getThemeColor: (lightColor, darkColor) => {
    return themeUtils.isDarkMode() ? darkColor : lightColor;
  }
};
