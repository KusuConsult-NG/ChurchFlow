'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function NotificationsSetup() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'EMAIL',
    trigger: 'MANUAL',
    template: '',
    recipients: [],
    conditions: {},
    isActive: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          type: 'EMAIL',
          trigger: 'MANUAL',
          template: '',
          recipients: [],
          conditions: {},
          isActive: true
        });
        fetchNotifications();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create notification');
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

  const handleRecipientChange = (recipient) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(recipient)
        ? prev.recipients.filter(r => r !== recipient)
        : [...prev.recipients, recipient]
    }));
  };

  const testNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Test notification sent successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send test notification');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const notificationTypes = [
    { id: 'EMAIL', name: 'Email', description: 'Send email notifications' },
    { id: 'SMS', name: 'SMS', description: 'Send text message notifications' },
    { id: 'PUSH', name: 'Push Notification', description: 'Send push notifications to mobile apps' },
    { id: 'WEBHOOK', name: 'Webhook', description: 'Send data to external webhook' }
  ];

  const triggerTypes = [
    { id: 'MANUAL', name: 'Manual', description: 'Triggered manually by users' },
    { id: 'SCHEDULED', name: 'Scheduled', description: 'Triggered on a schedule' },
    { id: 'EVENT_BASED', name: 'Event Based', description: 'Triggered by specific events' },
    { id: 'CONDITIONAL', name: 'Conditional', description: 'Triggered when conditions are met' }
  ];

  const recipientGroups = [
    { id: 'ALL_MEMBERS', name: 'All Members' },
    { id: 'ADMIN_USERS', name: 'Admin Users' },
    { id: 'MINISTRY_LEADERS', name: 'Ministry Leaders' },
    { id: 'VOLUNTEERS', name: 'Volunteers' },
    { id: 'YOUTH_GROUP', name: 'Youth Group' },
    { id: 'SENIORS', name: 'Seniors' }
  ];

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading notifications...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Automated Notifications</h1>
        <p className="mt-2 text-gray-600">Configure and manage automated notification systems</p>
      </div>

      {/* Notification Templates */}
      <div className="card mb-8">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Templates</h2>
              <p className="text-gray-600">Pre-configured notification templates</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Template
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notifications.map((notification) => (
            <div key={notification.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{notification.name}</h3>
                <span className={`status-badge ${
                  notification.isActive ? 'status-completed' : 'status-pending'
                }`}>
                  {notification.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{notification.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="font-medium">Type:</span>
                  <span className="ml-1">{notification.type}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="font-medium">Trigger:</span>
                  <span className="ml-1">{notification.trigger}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="font-medium">Recipients:</span>
                  <span className="ml-1">{notification.recipients.length} groups</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => testNotification(notification.id)}
                  className="btn-secondary text-xs"
                >
                  Test
                </button>
                <button
                  onClick={() => {
                    // Handle edit
                  }}
                  className="btn-secondary text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this notification?')) {
                      // Handle delete
                    }
                  }}
                  className="btn-danger text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications configured</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first notification template.</p>
          </div>
        )}
      </div>

      {/* Create Notification Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Notification Template</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Template Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="e.g., Weekly Announcements"
                  />
                </div>

                <div>
                  <label className="form-label">Notification Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="form-input"
                  placeholder="Describe what this notification does..."
                />
              </div>

              <div>
                <label className="form-label">Trigger Type</label>
                <select
                  name="trigger"
                  value={formData.trigger}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  {triggerTypes.map(trigger => (
                    <option key={trigger.id} value={trigger.id}>{trigger.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Recipients</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {recipientGroups.map(group => (
                    <label key={group.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.recipients.includes(group.id)}
                        onChange={() => handleRecipientChange(group.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Message Template</label>
                <textarea
                  name="template"
                  value={formData.template}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="form-input"
                  placeholder="Enter your message template. Use {{variable}} for dynamic content..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Available variables: {{name}}, {{email}}, {{date}}, {{event}}, {{amount}}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Active notification</label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
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
