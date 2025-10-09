// lib/analytics.js
import { v4 as uuidv4 } from 'uuid';

// Analytics configuration
export const analyticsConfig = {
  // Event types
  eventTypes: {
    PAGE_VIEW: 'page_view',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_REGISTER: 'user_register',
    FILE_UPLOAD: 'file_upload',
    EMAIL_SENT: 'email_sent',
    SMS_SENT: 'sms_sent',
    EVENT_CREATED: 'event_created',
    EVENT_ATTENDED: 'event_attended',
    ANNOUNCEMENT_CREATED: 'announcement_created',
    ANNOUNCEMENT_VIEWED: 'announcement_viewed',
    MEMBER_ADDED: 'member_added',
    MEMBER_UPDATED: 'member_updated',
    TRANSACTION_CREATED: 'transaction_created',
    REPORT_GENERATED: 'report_generated',
    SEARCH_PERFORMED: 'search_performed',
    ERROR_OCCURRED: 'error_occurred'
  },

  // Data retention settings
  retention: {
    events: 365, // days
    sessions: 30, // days
    users: 365 // days
  },

  // Privacy settings
  privacy: {
    anonymizeIP: true,
    respectDoNotTrack: true,
    allowCookies: true
  }
};

// Analytics service class
class AnalyticsService {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = null;
    this.isEnabled = this.isAnalyticsEnabled();
    this.eventQueue = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    this.startFlushInterval();
  }

  // Initialize analytics for a user
  initialize(userId, userProperties = {}) {
    this.userId = userId;
    this.track(analyticsConfig.eventTypes.USER_LOGIN, {
      user_id: userId,
      ...userProperties
    });
  }

  // Track an event
  track(eventType, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      id: uuidv4(),
      event_type: eventType,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: this.sanitizeProperties(properties),
      url: typeof window !== 'undefined' ? window.location.href : null,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
      ip_address: this.getClientIP()
    };

    this.eventQueue.push(event);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  // Track page view
  trackPageView(page, properties = {}) {
    this.track(analyticsConfig.eventTypes.PAGE_VIEW, {
      page,
      ...properties
    });
  }

  // Track user action
  trackUserAction(action, properties = {}) {
    this.track('user_action', {
      action,
      ...properties
    });
  }

  // Track error
  trackError(error, properties = {}) {
    this.track(analyticsConfig.eventTypes.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.name,
      ...properties
    });
  }

  // Track performance metrics
  trackPerformance(metric, value, properties = {}) {
    this.track('performance_metric', {
      metric,
      value,
      ...properties
    });
  }

  // Track conversion
  trackConversion(conversionType, value, properties = {}) {
    this.track('conversion', {
      conversion_type: conversionType,
      conversion_value: value,
      ...properties
    });
  }

  // Flush events to server
  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Analytics flush failed:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  // Get analytics data
  async getAnalyticsData(timeRange = '30d', metrics = []) {
    try {
      const response = await fetch(
        `/api/analytics/data?timeRange=${timeRange}&metrics=${metrics.join(',')}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return null;
    }
  }

  // Get user analytics
  async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const response = await fetch(
        `/api/analytics/user/${userId}?timeRange=${timeRange}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      return null;
    }
  }

  // Get session analytics
  async getSessionAnalytics(sessionId) {
    try {
      const response = await fetch(`/api/analytics/session/${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch session analytics:', error);
      return null;
    }
  }

  // Private methods
  getOrCreateSessionId() {
    if (typeof window === 'undefined') return uuidv4();

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  isAnalyticsEnabled() {
    if (typeof window === 'undefined') return true;

    // Check if user has opted out
    if (localStorage.getItem('analytics_opt_out') === 'true') {
      return false;
    }

    // Check Do Not Track
    if (
      analyticsConfig.privacy.respectDoNotTrack &&
      navigator.doNotTrack === '1'
    ) {
      return false;
    }

    return true;
  }

  sanitizeProperties(properties) {
    const sanitized = { ...properties };

    // Remove sensitive data
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'credit_card'
    ];
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        delete sanitized[key];
      }
    });

    // Limit property values length
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...';
      }
    });

    return sanitized;
  }

  getClientIP() {
    // In a real implementation, this would be handled server-side
    return '127.0.0.1';
  }

  startFlushInterval() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Opt out of analytics
  optOut() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_opt_out', 'true');
    }
    this.isEnabled = false;
    this.eventQueue = [];
  }

  // Opt in to analytics
  optIn() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_opt_out');
    }
    this.isEnabled = true;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Analytics hooks for React
export const useAnalytics = () => {
  return {
    track: (eventType, properties) => analytics.track(eventType, properties),
    trackPageView: (page, properties) =>
      analytics.trackPageView(page, properties),
    trackUserAction: (action, properties) =>
      analytics.trackUserAction(action, properties),
    trackError: (error, properties) => analytics.trackError(error, properties),
    trackPerformance: (metric, value, properties) =>
      analytics.trackPerformance(metric, value, properties),
    trackConversion: (conversionType, value, properties) =>
      analytics.trackConversion(conversionType, value, properties)
  };
};

// Analytics utilities
export const analyticsUtils = {
  // Calculate metrics
  calculateMetrics: events => {
    const metrics = {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.user_id)).size,
      uniqueSessions: new Set(events.map(e => e.session_id)).size,
      eventTypes: {},
      topPages: {},
      topActions: {},
      conversionRate: 0,
      averageSessionDuration: 0
    };

    // Count event types
    events.forEach(event => {
      metrics.eventTypes[event.event_type] =
        (metrics.eventTypes[event.event_type] || 0) + 1;
    });

    // Count page views
    events
      .filter(e => e.event_type === 'page_view')
      .forEach(event => {
        const page = event.properties.page || 'unknown';
        metrics.topPages[page] = (metrics.topPages[page] || 0) + 1;
      });

    // Count user actions
    events
      .filter(e => e.event_type === 'user_action')
      .forEach(event => {
        const action = event.properties.action || 'unknown';
        metrics.topActions[action] = (metrics.topActions[action] || 0) + 1;
      });

    // Calculate conversion rate
    const conversions = events.filter(
      e => e.event_type === 'conversion'
    ).length;
    const totalUsers = metrics.uniqueUsers;
    metrics.conversionRate =
      totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;

    return metrics;
  },

  // Generate reports
  generateReport: (events, reportType = 'summary') => {
    const metrics = analyticsUtils.calculateMetrics(events);

    switch (reportType) {
    case 'summary':
      return {
        period: 'Last 30 days',
        totalEvents: metrics.totalEvents,
        uniqueUsers: metrics.uniqueUsers,
        uniqueSessions: metrics.uniqueSessions,
        conversionRate: metrics.conversionRate,
        topEventTypes: Object.entries(metrics.eventTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        topPages: Object.entries(metrics.topPages)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
      };

    case 'user_engagement':
      return {
        totalUsers: metrics.uniqueUsers,
        activeUsers: events.filter(e => e.event_type === 'user_action')
          .length,
        newUsers: events.filter(e => e.event_type === 'user_register').length,
        returningUsers:
            metrics.uniqueUsers -
            events.filter(e => e.event_type === 'user_register').length,
        averageEventsPerUser: metrics.totalEvents / metrics.uniqueUsers
      };

    case 'performance':
      const performanceEvents = events.filter(
        e => e.event_type === 'performance_metric'
      );
      return {
        totalMetrics: performanceEvents.length,
        averageLoadTime:
            performanceEvents
              .filter(e => e.properties.metric === 'page_load_time')
              .reduce((sum, e) => sum + e.properties.value, 0) /
            performanceEvents.length,
        slowestPages: performanceEvents
          .filter(e => e.properties.metric === 'page_load_time')
          .sort((a, b) => b.properties.value - a.properties.value)
          .slice(0, 5)
      };

    default:
      return metrics;
    }
  },

  // Export data
  exportData: (events, format = 'json') => {
    switch (format) {
    case 'json':
      return JSON.stringify(events, null, 2);

    case 'csv':
      if (events.length === 0) return '';

      const headers = Object.keys(events[0]).join(',');
      const rows = events.map(event =>
        Object.values(event)
          .map(value =>
            typeof value === 'object' ? JSON.stringify(value) : value
          )
          .join(',')
      );

      return [headers, ...rows].join('\n');

    case 'excel':
      // In a real implementation, this would use a library like xlsx
      return analyticsUtils.exportData(events, 'csv');

    default:
      return events;
    }
  }
};


