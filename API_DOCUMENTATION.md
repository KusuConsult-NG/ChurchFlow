# ChurchFlow API Documentation

## Overview

The ChurchFlow API provides programmatic access to church management functionality. This RESTful API allows you to integrate ChurchFlow with external systems, build custom applications, and automate church operations.

## Base URL

```
Production: https://yourdomain.com/api
Development: http://localhost:3000/api
```

## Authentication

### API Keys

All API requests require authentication using API keys:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://yourdomain.com/api/members
```

### Rate Limiting

- **Standard Rate Limit**: 100 requests per 15 minutes
- **Authentication Endpoints**: 10 requests per 5 minutes
- **File Upload Endpoints**: 5 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Endpoints

### Authentication

#### POST /api/auth/login

Authenticate a user and receive an access token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "member"
  }
}
```

#### POST /api/auth/logout

Logout and invalidate the current token.

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Members

#### GET /api/members

Retrieve a list of members.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `role` (optional): Filter by role

**Response:**

```json
{
  "success": true,
  "members": [
    {
      "id": "member123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "member",
      "joinedAt": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### POST /api/members

Create a new member.

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "role": "member",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  }
}
```

**Response:**

```json
{
  "success": true,
  "member": {
    "id": "member456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "role": "member",
    "joinedAt": "2024-01-20T14:30:00Z",
    "status": "active"
  }
}
```

#### GET /api/members/{id}

Retrieve a specific member.

**Response:**

```json
{
  "success": true,
  "member": {
    "id": "member123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "member",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip": "12345"
    },
    "joinedAt": "2024-01-15T10:30:00Z",
    "status": "active",
    "family": [
      {
        "id": "member124",
        "name": "Jane Doe",
        "relationship": "spouse"
      }
    ]
  }
}
```

#### PUT /api/members/{id}

Update a member's information.

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "+1987654321",
  "address": {
    "street": "456 Oak Ave",
    "city": "Newtown",
    "state": "CA",
    "zip": "54321"
  }
}
```

#### DELETE /api/members/{id}

Delete a member (soft delete).

**Response:**

```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

### Events

#### GET /api/events

Retrieve a list of events.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter events from this date
- `endDate` (optional): Filter events until this date
- `type` (optional): Filter by event type

**Response:**

```json
{
  "success": true,
  "events": [
    {
      "id": "event123",
      "title": "Sunday Service",
      "description": "Weekly worship service",
      "date": "2024-01-21",
      "time": "10:00:00",
      "location": "Main Sanctuary",
      "type": "worship",
      "status": "scheduled",
      "attendees": 85,
      "capacity": 100
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### POST /api/events

Create a new event.

**Request Body:**

```json
{
  "title": "Bible Study",
  "description": "Weekly Bible study group",
  "date": "2024-01-25",
  "time": "19:00:00",
  "location": "Room 101",
  "type": "study",
  "capacity": 20,
  "registrationRequired": true
}
```

#### GET /api/events/{id}

Retrieve a specific event.

#### PUT /api/events/{id}

Update an event.

#### DELETE /api/events/{id}

Delete an event.

### Attendance

#### GET /api/attendance

Retrieve attendance records.

**Query Parameters:**

- `eventId` (optional): Filter by event
- `userId` (optional): Filter by user
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter until date

**Response:**

```json
{
  "success": true,
  "attendance": [
    {
      "id": "attendance123",
      "eventId": "event123",
      "userId": "member123",
      "status": "present",
      "recordedAt": "2024-01-21T10:15:00Z",
      "notes": "On time",
      "user": {
        "id": "member123",
        "name": "John Doe"
      },
      "event": {
        "id": "event123",
        "title": "Sunday Service"
      }
    }
  ],
  "stats": {
    "total": 85,
    "present": 80,
    "absent": 3,
    "late": 2,
    "excused": 0
  }
}
```

#### POST /api/attendance

Record attendance for an event.

**Request Body:**

```json
{
  "eventId": "event123",
  "userId": "member123",
  "status": "present",
  "notes": "On time"
}
```

#### PUT /api/attendance/{id}

Update an attendance record.

#### DELETE /api/attendance/{id}

Delete an attendance record.

### Announcements

#### GET /api/announcements

Retrieve announcements.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `priority` (optional): Filter by priority
- `status` (optional): Filter by status

**Response:**

```json
{
  "success": true,
  "announcements": [
    {
      "id": "announcement123",
      "title": "Church Picnic",
      "content": "Join us for our annual church picnic...",
      "priority": "normal",
      "targetAudience": "all",
      "status": "published",
      "createdAt": "2024-01-20T09:00:00Z",
      "author": {
        "id": "admin123",
        "name": "Pastor Smith"
      }
    }
  ]
}
```

#### POST /api/announcements

Create a new announcement.

**Request Body:**

```json
{
  "title": "Important Update",
  "content": "This is an important announcement...",
  "priority": "high",
  "targetAudience": "all",
  "sendNotifications": true
}
```

#### PUT /api/announcements/{id}

Update an announcement.

#### DELETE /api/announcements/{id}

Delete an announcement.

### File Management

#### POST /api/upload

Upload a file.

**Request Body:** (multipart/form-data)

- `file`: The file to upload
- `folder` (optional): Folder to store the file
- `processOptions` (optional): Image processing options

**Response:**

```json
{
  "success": true,
  "url": "https://cloudinary.com/image/upload/v1234567890/file.jpg",
  "publicId": "file_1234567890",
  "method": "Cloudinary"
}
```

#### DELETE /api/upload

Delete a file.

**Request Body:**

```json
{
  "publicId": "file_1234567890",
  "method": "Cloudinary"
}
```

### Email

#### POST /api/email

Send an email.

**Request Body:**

```json
{
  "to": "member@example.com",
  "subject": "Welcome to ChurchFlow",
  "htmlContent": "<p>Welcome to our church community!</p>",
  "textContent": "Welcome to our church community!",
  "type": "welcome",
  "data": {
    "userName": "John Doe",
    "loginLink": "https://yourdomain.com/login"
  }
}
```

### Notifications

#### POST /api/notifications

Send multi-channel notifications.

**Request Body:**

```json
{
  "userId": "member123",
  "toEmail": "member@example.com",
  "toPhone": "+1234567890",
  "type": "announcement",
  "data": {
    "title": "New Announcement",
    "content": "Check out our latest announcement"
  },
  "subject": "New Announcement",
  "message": "Check out our latest announcement"
}
```

### Analytics

#### GET /api/analytics/data

Retrieve analytics data.

**Query Parameters:**

- `timeRange` (optional): Time range (7d, 30d, 90d, 1y)
- `metrics` (optional): Comma-separated list of metrics

**Response:**

```json
{
  "success": true,
  "events": [...],
  "metrics": {
    "totalEvents": 1250,
    "uniqueUsers": 150,
    "uniqueSessions": 200,
    "eventTypes": {
      "page_view": 800,
      "user_action": 300,
      "event_attended": 150
    }
  }
}
```

#### POST /api/analytics/track

Track analytics events.

**Request Body:**

```json
{
  "events": [
    {
      "id": "event123",
      "event_type": "page_view",
      "user_id": "user123",
      "session_id": "session123",
      "timestamp": "2024-01-21T10:30:00Z",
      "properties": {
        "page": "/dashboard",
        "referrer": "https://google.com"
      }
    }
  ]
}
```

### Health Check

#### GET /api/health

Check system health.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-21T10:30:00Z",
  "uptime": 86400,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 15,
      "message": "Database connection successful"
    },
    "redis": {
      "status": "ok",
      "message": "Redis connection successful"
    },
    "email": {
      "status": "ok",
      "provider": "sendgrid",
      "message": "Email service configured"
    }
  },
  "metrics": {
    "responseTime": 25,
    "memoryUsage": {
      "rss": 50000000,
      "heapTotal": 30000000,
      "heapUsed": 20000000
    }
  }
}
```

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes

- `INVALID_CREDENTIALS` - Invalid login credentials
- `UNAUTHORIZED` - Missing or invalid API key
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @churchflow/api-client
```

```javascript
import ChurchFlow from '@churchflow/api-client';

const client = new ChurchFlow({
  apiKey: 'your-api-key',
  baseUrl: 'https://yourdomain.com/api'
});

// Get members
const members = await client.members.list();

// Create event
const event = await client.events.create({
  title: 'Sunday Service',
  date: '2024-01-21',
  time: '10:00:00'
});
```

### Python

```bash
pip install churchflow-api
```

```python
from churchflow import ChurchFlow

client = ChurchFlow(api_key='your-api-key', base_url='https://yourdomain.com/api')

# Get members
members = client.members.list()

# Create event
event = client.events.create({
    'title': 'Sunday Service',
    'date': '2024-01-21',
    'time': '10:00:00'
})
```

### PHP

```bash
composer require churchflow/api-client
```

```php
use ChurchFlow\Client;

$client = new Client('your-api-key', 'https://yourdomain.com/api');

// Get members
$members = $client->members()->list();

// Create event
$event = $client->events()->create([
    'title' => 'Sunday Service',
    'date' => '2024-01-21',
    'time' => '10:00:00'
]);
```

## Webhooks

### Setting Up Webhooks

Configure webhooks to receive real-time notifications about events in your ChurchFlow system.

**Webhook URL Format:**

```
https://yourdomain.com/webhooks/churchflow
```

### Webhook Events

- `member.created` - New member registered
- `member.updated` - Member information updated
- `member.deleted` - Member deleted
- `event.created` - New event created
- `event.updated` - Event updated
- `event.deleted` - Event deleted
- `attendance.recorded` - Attendance recorded
- `announcement.published` - Announcement published

### Webhook Payload

```json
{
  "event": "member.created",
  "timestamp": "2024-01-21T10:30:00Z",
  "data": {
    "id": "member123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Webhook Security

Webhooks are secured using HMAC signatures:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
```

## Rate Limiting

### Limits by Endpoint Type

- **Authentication**: 10 requests per 5 minutes
- **Standard API**: 100 requests per 15 minutes
- **File Upload**: 5 requests per hour
- **Analytics**: 50 requests per 15 minutes

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 300
```

## Pagination

### Standard Pagination

Most list endpoints support pagination:

```
GET /api/members?page=2&limit=50
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "pages": 3,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Cursor-based Pagination

For large datasets, use cursor-based pagination:

```
GET /api/events?cursor=eyJpZCI6IjEyMyJ9&limit=20
```

## Filtering and Sorting

### Filtering

Use query parameters to filter results:

```
GET /api/members?role=member&status=active&search=john
```

### Sorting

Sort results using the `sort` parameter:

```
GET /api/events?sort=date:desc
GET /api/members?sort=name:asc
```

## Data Export

### Export Formats

- **JSON**: `GET /api/members?format=json`
- **CSV**: `GET /api/members?format=csv`
- **Excel**: `GET /api/members?format=xlsx`

### Bulk Export

For large datasets, use the bulk export endpoint:

```
POST /api/export/members
{
  "format": "csv",
  "filters": {
    "role": "member",
    "status": "active"
  }
}
```

## Testing

### Sandbox Environment

Use the sandbox environment for testing:

```
Base URL: https://sandbox.yourdomain.com/api
```

### Test Data

The sandbox includes test data that resets daily.

### API Testing Tools

- **Postman**: Import our Postman collection
- **Insomnia**: Use our Insomnia workspace
- **curl**: Examples provided for each endpoint

---

_This API documentation is regularly updated. For the latest version, visit the API Documentation section in your ChurchFlow admin panel._

