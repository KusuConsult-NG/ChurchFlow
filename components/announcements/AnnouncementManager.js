// components/announcements/AnnouncementManager.js
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import {
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage
} from '../ui/ErrorBoundary';
import {
  Input,
  Textarea,
  Select,
  Checkbox,
  useFormValidation
} from '../ui/FormComponents';

// Priority options
const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-gray-600', bg: 'bg-gray-100' },
  {
    value: 'normal',
    label: 'Normal',
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600', bg: 'bg-red-100' }
];

// Target audience options
const audienceOptions = [
  { value: 'all', label: 'All Members' },
  { value: 'members', label: 'Members Only' },
  { value: 'admins', label: 'Admins Only' },
  { value: 'volunteers', label: 'Volunteers Only' }
];

// Announcement manager component
export const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements');
      const result = await response.json();

      if (result.success) {
        setAnnouncements(result.announcements);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async formData => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setAnnouncements(prev => [result.announcement, ...prev]);
        setShowForm(false);
        return { success: true, message: 'Announcement created successfully' };
      } else {
        return { success: false, message: result.error };
      }
    } catch (err) {
      return { success: false, message: 'Failed to create announcement' };
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...formData })
      });

      const result = await response.json();

      if (result.success) {
        setAnnouncements(prev =>
          prev.map(announcement =>
            announcement.id === id ? result.announcement : announcement
          )
        );
        setEditingAnnouncement(null);
        return { success: true, message: 'Announcement updated successfully' };
      } else {
        return { success: false, message: result.error };
      }
    } catch (err) {
      return { success: false, message: 'Failed to update announcement' };
    }
  };

  const handleDeleteAnnouncement = async id => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setAnnouncements(prev =>
          prev.filter(announcement => announcement.id !== id)
        );
        return { success: true, message: 'Announcement deleted successfully' };
      } else {
        return { success: false, message: result.error };
      }
    } catch (err) {
      return { success: false, message: 'Failed to delete announcement' };
    }
  };

  const getPriorityIcon = priority => {
    switch (priority) {
    case 'urgent':
      return <ExclamationTriangleIcon className='w-5 h-5 text-red-600' />;
    case 'high':
      return <ExclamationTriangleIcon className='w-5 h-5 text-orange-600' />;
    case 'normal':
      return <InformationCircleIcon className='w-5 h-5 text-blue-600' />;
    case 'low':
      return <CheckCircleIcon className='w-5 h-5 text-gray-600' />;
    default:
      return <InformationCircleIcon className='w-5 h-5 text-gray-600' />;
    }
  };

  const getPriorityColor = priority => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.bg : 'bg-gray-100';
  };

  if (loading) {
    return <LoadingSpinner size='lg' text='Loading announcements...' />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={loadAnnouncements} />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Announcements</h1>
          <p className='text-gray-600'>
            Manage church announcements and communications
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center'
        >
          <PlusIcon className='w-5 h-5 mr-2' />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {announcements.map(announcement => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center'>
                <div
                  className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)} mr-3`}
                >
                  {getPriorityIcon(announcement.priority)}
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {announcement.title}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                  title='View'
                >
                  <EyeIcon className='w-5 h-5' />
                </button>
                <button
                  onClick={() => setEditingAnnouncement(announcement)}
                  className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                  title='Edit'
                >
                  <PencilIcon className='w-5 h-5' />
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                  title='Delete'
                >
                  <TrashIcon className='w-5 h-5' />
                </button>
              </div>
            </div>

            <div className='mb-4'>
              <p className='text-gray-700 line-clamp-3'>
                {announcement.content}
              </p>
            </div>

            <div className='flex items-center justify-between text-sm text-gray-500'>
              <span>
                Target:{' '}
                {
                  audienceOptions.find(
                    opt => opt.value === announcement.targetAudience
                  )?.label
                }
              </span>
              <span className='flex items-center'>
                <BellIcon className='w-4 h-4 mr-1' />
                Notifications sent
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {announcements.length === 0 && (
        <div className='text-center py-12'>
          <BellIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No announcements yet
          </h3>
          <p className='text-gray-600 mb-4'>
            Create your first announcement to start communicating with your
            church community.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Create Announcement
          </button>
        </div>
      )}

      {/* Announcement Form Modal */}
      <AnimatePresence>
        {(showForm || editingAnnouncement) && (
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSubmit={
              editingAnnouncement
                ? handleUpdateAnnouncement
                : handleCreateAnnouncement
            }
            onClose={() => {
              setShowForm(false);
              setEditingAnnouncement(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Announcement View Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <AnnouncementView
            announcement={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Announcement form component
const AnnouncementForm = ({ announcement, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const validationRules = {
    title: [
      value => (!value ? 'Title is required' : ''),
      value => (value.length < 5 ? 'Title must be at least 5 characters' : ''),
      value =>
        value.length > 100 ? 'Title must be less than 100 characters' : ''
    ],
    content: [
      value => (!value ? 'Content is required' : ''),
      value =>
        value.length < 10 ? 'Content must be at least 10 characters' : '',
      value =>
        value.length > 2000 ? 'Content must be less than 2000 characters' : ''
    ]
  };

  const { values, errors, handleChange, handleBlur, validateForm } =
    useFormValidation(
      {
        title: announcement?.title || '',
        content: announcement?.content || '',
        priority: announcement?.priority || 'normal',
        targetAudience: announcement?.targetAudience || 'all',
        sendNotifications: true,
        scheduledAt: ''
      },
      validationRules
    );

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await onSubmit(announcement?.id, values);
      setMessage(result);

      if (result.success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setMessage({ success: false, message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75'
          onClick={onClose}
        />

        <div className='relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                {announcement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <button
                onClick={onClose}
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

            <form onSubmit={handleSubmit} className='space-y-6'>
              <Input
                label='Title'
                value={values.title}
                onChange={e => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                error={errors.title}
                placeholder='Enter announcement title'
                required
              />

              <Textarea
                label='Content'
                value={values.content}
                onChange={e => handleChange('content', e.target.value)}
                onBlur={() => handleBlur('content')}
                error={errors.content}
                placeholder='Enter announcement content'
                rows={6}
                required
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Select
                  label='Priority'
                  value={values.priority}
                  onChange={e => handleChange('priority', e.target.value)}
                  options={priorityOptions}
                />

                <Select
                  label='Target Audience'
                  value={values.targetAudience}
                  onChange={e => handleChange('targetAudience', e.target.value)}
                  options={audienceOptions}
                />
              </div>

              <div className='space-y-4'>
                <Checkbox
                  label='Send notifications to target audience'
                  checked={values.sendNotifications}
                  onChange={e =>
                    handleChange('sendNotifications', e.target.checked)
                  }
                />

                <Input
                  label='Schedule for later (optional)'
                  type='datetime-local'
                  value={values.scheduledAt}
                  onChange={e => handleChange('scheduledAt', e.target.value)}
                />
              </div>

              {message && (
                <div
                  className={
                    message.success ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {message.message}
                </div>
              )}

              <div className='flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                >
                  {loading && <LoadingSpinner size='sm' className='mr-2' />}
                  {announcement ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Announcement view component
const AnnouncementView = ({ announcement, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75'
          onClick={onClose}
        />

        <div className='relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Announcement Details
              </h2>
              <button
                onClick={onClose}
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

            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  {announcement.title}
                </h3>
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <span className='flex items-center'>
                    <CalendarIcon className='w-4 h-4 mr-1' />
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  <span>Priority: {announcement.priority}</span>
                  <span>
                    Target:{' '}
                    {
                      audienceOptions.find(
                        opt => opt.value === announcement.targetAudience
                      )?.label
                    }
                  </span>
                </div>
              </div>

              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Content</h4>
                <div className='prose max-w-none'>
                  <p className='text-gray-700 whitespace-pre-wrap'>
                    {announcement.content}
                  </p>
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  onClick={onClose}
                  className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

