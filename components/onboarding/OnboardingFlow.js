// components/onboarding/OnboardingFlow.js
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  BellIcon,
  CogIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

import {
  Input,
  Select,
  Checkbox,
  useFormValidation
} from '../ui/FormComponents';

// Onboarding steps configuration
const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to ChurchFlow',
    description: 'Let\'s get you set up with your church management system',
    component: 'WelcomeStep'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us a bit about yourself',
    component: 'ProfileStep'
  },
  {
    id: 'preferences',
    title: 'Notification Preferences',
    description: 'Choose how you\'d like to receive updates',
    component: 'PreferencesStep'
  },
  {
    id: 'setup',
    title: 'Initial Setup',
    description: 'Configure your church settings',
    component: 'SetupStep'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Welcome to your new church management system',
    component: 'CompleteStep'
  }
];

// Welcome step component
const WelcomeStep = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='text-center space-y-6'
    >
      <div className='mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center'>
        <span className='text-white font-bold text-3xl'>CF</span>
      </div>

      <div className='space-y-4'>
        <h2 className='text-3xl font-bold text-gray-900'>
          Welcome to ChurchFlow!
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Your comprehensive church management system is ready to help you
          organize, communicate, and grow your community.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
        <div className='text-center space-y-3'>
          <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto'>
            <UserIcon className='w-6 h-6 text-blue-600' />
          </div>
          <h3 className='font-semibold text-gray-900'>Member Management</h3>
          <p className='text-sm text-gray-600'>
            Organize member information and track attendance
          </p>
        </div>

        <div className='text-center space-y-3'>
          <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto'>
            <BellIcon className='w-6 h-6 text-green-600' />
          </div>
          <h3 className='font-semibold text-gray-900'>Communication</h3>
          <p className='text-sm text-gray-600'>
            Send announcements and event reminders
          </p>
        </div>

        <div className='text-center space-y-3'>
          <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto'>
            <CogIcon className='w-6 h-6 text-purple-600' />
          </div>
          <h3 className='font-semibold text-gray-900'>Administration</h3>
          <p className='text-sm text-gray-600'>
            Manage budgets, reports, and church operations
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className='mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto'
      >
        Get Started
        <ArrowRightIcon className='w-5 h-5 ml-2' />
      </button>
    </motion.div>
  );
};

// Profile step component
const ProfileStep = ({ onNext, onBack, data, setData }) => {
  const validationRules = {
    firstName: [
      value => (!value ? 'First name is required' : ''),
      value =>
        value.length < 2 ? 'First name must be at least 2 characters' : ''
    ],
    lastName: [
      value => (!value ? 'Last name is required' : ''),
      value =>
        value.length < 2 ? 'Last name must be at least 2 characters' : ''
    ],
    email: [
      value => (!value ? 'Email is required' : ''),
      value =>
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Please enter a valid email'
          : ''
    ],
    phone: [
      value =>
        value && !/^\+?[\d\s\-\(\)]+$/.test(value)
          ? 'Please enter a valid phone number'
          : ''
    ]
  };

  const { values, errors, handleChange, handleBlur, validateForm } =
    useFormValidation(data.profile || {}, validationRules);

  const handleNext = () => {
    if (validateForm()) {
      setData(prev => ({ ...prev, profile: values }));
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='max-w-2xl mx-auto space-y-6'
    >
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Complete Your Profile
        </h2>
        <p className='text-gray-600'>
          Help us personalize your ChurchFlow experience
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Input
          label='First Name'
          value={values.firstName || ''}
          onChange={e => handleChange('firstName', e.target.value)}
          onBlur={() => handleBlur('firstName')}
          error={errors.firstName}
          required
        />

        <Input
          label='Last Name'
          value={values.lastName || ''}
          onChange={e => handleChange('lastName', e.target.value)}
          onBlur={() => handleBlur('lastName')}
          error={errors.lastName}
          required
        />

        <Input
          label='Email Address'
          type='email'
          value={values.email || ''}
          onChange={e => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={errors.email}
          required
        />

        <Input
          label='Phone Number'
          type='tel'
          value={values.phone || ''}
          onChange={e => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={errors.phone}
          placeholder='+1 (555) 123-4567'
        />
      </div>

      <div className='flex justify-between pt-6'>
        <button
          onClick={onBack}
          className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
        >
          <ArrowLeftIcon className='w-5 h-5 mr-2' />
          Back
        </button>

        <button
          onClick={handleNext}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center'
        >
          Continue
          <ArrowRightIcon className='w-5 h-5 ml-2' />
        </button>
      </div>
    </motion.div>
  );
};

// Preferences step component
const PreferencesStep = ({ onNext, onBack, data, setData }) => {
  const [preferences, setPreferences] = useState(
    data.preferences || {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyDigest: true,
      eventReminders: true,
      announcementAlerts: true
    }
  );

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setData(prev => ({ ...prev, preferences: newPreferences }));
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='max-w-2xl mx-auto space-y-6'
    >
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Notification Preferences
        </h2>
        <p className='text-gray-600'>
          Choose how you'd like to receive updates and notifications
        </p>
      </div>

      <div className='space-y-6'>
        <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
          <h3 className='font-semibold text-gray-900'>
            Communication Channels
          </h3>

          <Checkbox
            label='Email Notifications'
            checked={preferences.emailNotifications}
            onChange={e =>
              handlePreferenceChange('emailNotifications', e.target.checked)
            }
          />

          <Checkbox
            label='SMS Notifications'
            checked={preferences.smsNotifications}
            onChange={e =>
              handlePreferenceChange('smsNotifications', e.target.checked)
            }
          />

          <Checkbox
            label='Push Notifications'
            checked={preferences.pushNotifications}
            onChange={e =>
              handlePreferenceChange('pushNotifications', e.target.checked)
            }
          />
        </div>

        <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
          <h3 className='font-semibold text-gray-900'>Notification Types</h3>

          <Checkbox
            label='Weekly Digest'
            checked={preferences.weeklyDigest}
            onChange={e =>
              handlePreferenceChange('weeklyDigest', e.target.checked)
            }
          />

          <Checkbox
            label='Event Reminders'
            checked={preferences.eventReminders}
            onChange={e =>
              handlePreferenceChange('eventReminders', e.target.checked)
            }
          />

          <Checkbox
            label='Announcement Alerts'
            checked={preferences.announcementAlerts}
            onChange={e =>
              handlePreferenceChange('announcementAlerts', e.target.checked)
            }
          />
        </div>
      </div>

      <div className='flex justify-between pt-6'>
        <button
          onClick={onBack}
          className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
        >
          <ArrowLeftIcon className='w-5 h-5 mr-2' />
          Back
        </button>

        <button
          onClick={handleNext}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center'
        >
          Continue
          <ArrowRightIcon className='w-5 h-5 ml-2' />
        </button>
      </div>
    </motion.div>
  );
};

// Setup step component
const SetupStep = ({ onNext, onBack, data, setData }) => {
  const [setup, setSetup] = useState(
    data.setup || {
      churchName: '',
      churchSize: '',
      timezone: 'America/New_York',
      currency: 'USD'
    }
  );

  const churchSizeOptions = [
    { value: 'small', label: 'Small (1-50 members)' },
    { value: 'medium', label: 'Medium (51-200 members)' },
    { value: 'large', label: 'Large (201-500 members)' },
    { value: 'mega', label: 'Mega (500+ members)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' }
  ];

  const handleChange = (key, value) => {
    const newSetup = { ...setup, [key]: value };
    setSetup(newSetup);
    setData(prev => ({ ...prev, setup: newSetup }));
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='max-w-2xl mx-auto space-y-6'
    >
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900'>Initial Setup</h2>
        <p className='text-gray-600'>Configure your church settings</p>
      </div>

      <div className='space-y-6'>
        <Input
          label='Church Name'
          value={setup.churchName}
          onChange={e => handleChange('churchName', e.target.value)}
          placeholder='Enter your church name'
        />

        <Select
          label='Church Size'
          value={setup.churchSize}
          onChange={e => handleChange('churchSize', e.target.value)}
          options={churchSizeOptions}
          placeholder='Select church size'
        />

        <Select
          label='Currency'
          value={setup.currency}
          onChange={e => handleChange('currency', e.target.value)}
          options={currencyOptions}
        />
      </div>

      <div className='flex justify-between pt-6'>
        <button
          onClick={onBack}
          className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
        >
          <ArrowLeftIcon className='w-5 h-5 mr-2' />
          Back
        </button>

        <button
          onClick={handleNext}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center'
        >
          Complete Setup
          <ArrowRightIcon className='w-5 h-5 ml-2' />
        </button>
      </div>
    </motion.div>
  );
};

// Complete step component
const CompleteStep = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className='text-center space-y-6'
    >
      <div className='mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center'>
        <CheckCircleIcon className='w-12 h-12 text-green-600' />
      </div>

      <div className='space-y-4'>
        <h2 className='text-3xl font-bold text-gray-900'>You're All Set!</h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Your ChurchFlow account is ready to use. You can now start managing
          your church community, sending announcements, and tracking events.
        </p>
      </div>

      <div className='bg-blue-50 rounded-lg p-6 max-w-md mx-auto'>
        <h3 className='font-semibold text-blue-900 mb-3'>What's Next?</h3>
        <div className='space-y-2 text-left'>
          <div className='flex items-center text-sm text-blue-800'>
            <CheckIcon className='w-4 h-4 mr-2' />
            Explore the dashboard
          </div>
          <div className='flex items-center text-sm text-blue-800'>
            <CheckIcon className='w-4 h-4 mr-2' />
            Add your first members
          </div>
          <div className='flex items-center text-sm text-blue-800'>
            <CheckIcon className='w-4 h-4 mr-2' />
            Create an event
          </div>
          <div className='flex items-center text-sm text-blue-800'>
            <CheckIcon className='w-4 h-4 mr-2' />
            Send an announcement
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className='bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
      >
        Go to Dashboard
      </button>
    </motion.div>
  );
};

// Main onboarding flow component
export const OnboardingFlow = ({ isOpen, onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding data to user profile
    console.log('Onboarding completed:', onboardingData);
    onComplete();
  };

  const renderStep = () => {
    const step = onboardingSteps[currentStep];
    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      data: onboardingData,
      setData: setOnboardingData
    };

    switch (step.component) {
    case 'WelcomeStep':
      return <WelcomeStep {...commonProps} />;
    case 'ProfileStep':
      return <ProfileStep {...commonProps} />;
    case 'PreferencesStep':
      return <PreferencesStep {...commonProps} />;
    case 'SetupStep':
      return <SetupStep {...commonProps} />;
    case 'CompleteStep':
      return <CompleteStep onComplete={handleComplete} />;
    default:
      return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75' />

        <div className='relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Progress bar */}
          <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <span className='text-sm text-gray-500'>
                {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}
                % Complete
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{
                  width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className='p-8'>
            <AnimatePresence mode='wait'>{renderStep()}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
