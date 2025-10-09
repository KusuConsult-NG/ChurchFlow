// tests/lib/analytics.test.js
import {
  analytics,
  analyticsUtils,
  analyticsConfig
} from '../../lib/analytics.js';

// Mock fetch
global.fetch = jest.fn();

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('analyticsConfig', () => {
    test('should have required event types', () => {
      expect(analyticsConfig.eventTypes).toHaveProperty('PAGE_VIEW');
      expect(analyticsConfig.eventTypes).toHaveProperty('USER_LOGIN');
      expect(analyticsConfig.eventTypes).toHaveProperty('USER_LOGOUT');
      expect(analyticsConfig.eventTypes).toHaveProperty('FILE_UPLOAD');
    });

    test('should have retention settings', () => {
      expect(analyticsConfig.retention).toHaveProperty('events');
      expect(analyticsConfig.retention).toHaveProperty('sessions');
      expect(analyticsConfig.retention).toHaveProperty('users');
    });

    test('should have privacy settings', () => {
      expect(analyticsConfig.privacy).toHaveProperty('anonymizeIP');
      expect(analyticsConfig.privacy).toHaveProperty('respectDoNotTrack');
      expect(analyticsConfig.privacy).toHaveProperty('allowCookies');
    });
  });

  describe('AnalyticsService', () => {
    test('should initialize with session ID', () => {
      expect(analytics.sessionId).toBeDefined();
      expect(typeof analytics.sessionId).toBe('string');
    });

    test('should track events', () => {
      const trackSpy = jest.spyOn(analytics, 'track');

      analytics.track('test_event', { test: 'data' });

      expect(trackSpy).toHaveBeenCalledWith('test_event', { test: 'data' });
    });

    test('should track page views', () => {
      const trackSpy = jest.spyOn(analytics, 'track');

      analytics.trackPageView('/test-page', { referrer: 'test' });

      expect(trackSpy).toHaveBeenCalledWith(
        analyticsConfig.eventTypes.PAGE_VIEW,
        { page: '/test-page', referrer: 'test' }
      );
    });

    test('should track user actions', () => {
      const trackSpy = jest.spyOn(analytics, 'track');

      analytics.trackUserAction('button_click', { button: 'submit' });

      expect(trackSpy).toHaveBeenCalledWith('user_action', {
        action: 'button_click',
        button: 'submit'
      });
    });

    test('should track errors', () => {
      const trackSpy = jest.spyOn(analytics, 'track');
      const error = new Error('Test error');

      analytics.trackError(error, { context: 'test' });

      expect(trackSpy).toHaveBeenCalledWith(
        analyticsConfig.eventTypes.ERROR_OCCURRED,
        {
          error_message: 'Test error',
          error_stack: error.stack,
          error_type: 'Error',
          context: 'test'
        }
      );
    });

    test('should sanitize sensitive properties', () => {
      const trackSpy = jest.spyOn(analytics, 'track');

      analytics.track('test_event', {
        password: 'secret123',
        token: 'abc123',
        normalData: 'safe'
      });

      expect(trackSpy).toHaveBeenCalledWith('test_event', {
        normalData: 'safe'
      });
    });

    test('should flush events to server', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      analytics.eventQueue = [
        { id: '1', event_type: 'test', timestamp: new Date().toISOString() }
      ];

      await analytics.flush();

      expect(fetch).toHaveBeenCalledWith('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: analytics.eventQueue })
      });
    });

    test('should handle flush errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const originalQueue = [{ id: '1', event_type: 'test' }];
      analytics.eventQueue = [...originalQueue];

      await analytics.flush();

      // Events should be re-added to queue on error
      expect(analytics.eventQueue).toEqual(originalQueue);
    });
  });

  describe('analyticsUtils', () => {
    const mockEvents = [
      { event_type: 'page_view', user_id: 'user1', session_id: 'session1' },
      { event_type: 'page_view', user_id: 'user2', session_id: 'session2' },
      { event_type: 'user_action', user_id: 'user1', session_id: 'session1' },
      { event_type: 'conversion', user_id: 'user1', session_id: 'session1' }
    ];

    test('should calculate metrics correctly', () => {
      const metrics = analyticsUtils.calculateMetrics(mockEvents);

      expect(metrics.totalEvents).toBe(4);
      expect(metrics.uniqueUsers).toBe(2);
      expect(metrics.uniqueSessions).toBe(2);
      expect(metrics.eventTypes.page_view).toBe(2);
      expect(metrics.eventTypes.user_action).toBe(1);
      expect(metrics.eventTypes.conversion).toBe(1);
    });

    test('should generate summary report', () => {
      const report = analyticsUtils.generateReport(mockEvents, 'summary');

      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('totalEvents');
      expect(report).toHaveProperty('uniqueUsers');
      expect(report).toHaveProperty('uniqueSessions');
      expect(report).toHaveProperty('conversionRate');
      expect(report).toHaveProperty('topEventTypes');
      expect(report).toHaveProperty('topPages');
    });

    test('should generate user engagement report', () => {
      const report = analyticsUtils.generateReport(
        mockEvents,
        'user_engagement'
      );

      expect(report).toHaveProperty('totalUsers');
      expect(report).toHaveProperty('activeUsers');
      expect(report).toHaveProperty('newUsers');
      expect(report).toHaveProperty('returningUsers');
      expect(report).toHaveProperty('averageEventsPerUser');
    });

    test('should export data in JSON format', () => {
      const jsonData = analyticsUtils.exportData(mockEvents, 'json');
      const parsed = JSON.parse(jsonData);

      expect(parsed).toEqual(mockEvents);
    });

    test('should export data in CSV format', () => {
      const csvData = analyticsUtils.exportData(mockEvents, 'csv');
      const lines = csvData.split('\n');

      expect(lines[0]).toContain('event_type');
      expect(lines[0]).toContain('user_id');
      expect(lines[0]).toContain('session_id');
      expect(lines.length).toBe(mockEvents.length + 1);
    });

    test('should handle empty events array', () => {
      const metrics = analyticsUtils.calculateMetrics([]);

      expect(metrics.totalEvents).toBe(0);
      expect(metrics.uniqueUsers).toBe(0);
      expect(metrics.uniqueSessions).toBe(0);
      expect(metrics.conversionRate).toBe(0);
    });
  });

  describe('Privacy and Opt-out', () => {
    test('should respect opt-out setting', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('true'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });

      const newAnalytics = new analytics.constructor();
      expect(newAnalytics.isEnabled).toBe(false);
    });

    test('should opt out when requested', () => {
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });

      analytics.optOut();
      expect(analytics.isEnabled).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'analytics_opt_out',
        'true'
      );
    });

    test('should opt in when requested', () => {
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('true'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });

      analytics.optIn();
      expect(analytics.isEnabled).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'analytics_opt_out'
      );
    });
  });
});


