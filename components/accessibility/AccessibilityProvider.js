// components/accessibility/AccessibilityProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Accessibility context
const AccessibilityContext = createContext();

// Accessibility provider component
export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    // Visual preferences
    fontSize: 'medium', // small, medium, large, extra-large
    highContrast: false,
    darkMode: false,

    // Motion preferences
    reduceMotion: false,

    // Focus preferences
    focusVisible: true,

    // Screen reader preferences
    screenReader: false,

    // Keyboard navigation
    keyboardNavigation: true
  });
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      'accessibility-preferences',
      JSON.stringify(preferences)
    );
  }, [preferences]);

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.fontSize = fontSizeMap[preferences.fontSize] || '16px';

    // High contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Dark mode
    if (preferences.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Reduce motion
    if (preferences.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus visible
    if (preferences.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      fontSize: 'medium',
      highContrast: false,
      darkMode: false,
      reduceMotion: false,
      focusVisible: true,
      screenReader: false,
      keyboardNavigation: true
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
};

// Skip link component for keyboard navigation
export const SkipLink = ({ href, children }) => {
  return (
    <a
      href={href}
      className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
    >
      {children}
    </a>
  );
};

// Focus trap component
export const FocusTrap = ({ children, isActive }) => {
  const containerRef = React.useRef(null);
  const firstFocusableRef = React.useRef(null);
  const lastFocusableRef = React.useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    const handleKeyDown = e => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableRef.current) {
            lastFocusableRef.current.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableRef.current) {
            firstFocusableRef.current.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return <div ref={containerRef}>{children}</div>;
};

// Screen reader only text component
export const ScreenReaderOnly = ({ children }) => {
  return <span className='sr-only'>{children}</span>;
};

// Accessible button component
export const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible link component
export const AccessibleLink = ({
  href,
  children,
  external = false,
  ariaLabel,
  className = '',
  ...props
}) => {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
      {external && <ScreenReaderOnly> (opens in new tab)</ScreenReaderOnly>}
    </a>
  );
};

// Accessible form field component
export const AccessibleFormField = ({
  label,
  error,
  required = false,
  children,
  id,
  className = ''
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={fieldId}
        className='block text-sm font-medium text-gray-700'
      >
        {label}
        {required && (
          <span className='text-red-500 ml-1' aria-label='required'>
            *
          </span>
        )}
      </label>

      {React.cloneElement(children, {
        id: fieldId,
        'aria-describedby': errorId,
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required
      })}

      {error && (
        <p id={errorId} className='text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};

// Live region component for announcements
export const LiveRegion = ({ children, politeness = 'polite' }) => {
  return (
    <div aria-live={politeness} aria-atomic='true' className='sr-only'>
      {children}
    </div>
  );
};

// Keyboard navigation hook
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
};

// Accessibility utilities
export const accessibilityUtils = {
  // Generate unique IDs for form elements
  generateId: (prefix = 'id') =>
    `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Check if element is visible to screen readers
  isVisibleToScreenReader: element => {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.getAttribute('aria-hidden') !== 'true'
    );
  },

  // Announce text to screen readers
  announceToScreenReader: (text, politeness = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', politeness);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = text;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Get accessible color contrast ratio
  getContrastRatio: (color1, color2) => {
    // This is a simplified version - in production, use a proper color contrast library
    return 4.5; // Placeholder value
  },

  // Validate ARIA attributes
  validateAriaAttributes: element => {
    const issues = [];

    // Check for required ARIA attributes
    if (
      element.getAttribute('aria-expanded') &&
      !element.getAttribute('aria-controls')
    ) {
      issues.push('aria-expanded requires aria-controls');
    }

    if (
      element.getAttribute('aria-labelledby') &&
      !document.getElementById(element.getAttribute('aria-labelledby'))
    ) {
      issues.push('aria-labelledby references non-existent element');
    }

    return issues;
  }
};
