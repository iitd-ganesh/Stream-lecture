# API Reference (YouTube Edition)

Complete API documentation for the lecture visitor tracking backend.

---

## Overview

The backend provides two endpoints:
- `POST /api/visit` - Track anonymous visitor
- `GET /api/admin/visitor-count` - Get visitor statistics (admin only)

All endpoints use HTTPS and enforce CORS restrictions. YouTube video hosting is handled separately by YouTube's infrastructure.

---

## POST /api/visit

Track an anonymous visitor to the lecture page.

### Request

**URL:** `POST https://yourdomain.com/api/visit`

**Headers:**
```
Content-Type: application/json
Origin: https://yourdomain.com
```

**Body:**
```json
{
  "lectureId": "lecture-01",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lectureId` | string | Yes | Must be exactly "lecture-01" |
| `sessionId` | string (UUID) | Yes | Random session identifier from client |

### Response - Success (200)

```json
{
  "success": true
}
```

### Response - Errors

**400 Bad Request** - Invalid JSON or missing fields:
```json
{
  "error": "Invalid request"
}
```

**403 Forbidden** - Invalid origin:
```json
{
  "error": "Unauthorized origin"
}
```

**404 Not Found** - Invalid lecture ID:
```json
{
  "error": "Lecture not found"
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "success": false
}
```

**500 Internal Server Error** - Backend failure:
```json
{
  "success": false
}
```

### Example Usage

```bash
curl -X POST https://yourdomain.com/api/visit \
  -H "Content-Type: application/json" \
  -H "Origin: https://yourdomain.com" \
  -d '{
    "lectureId": "lecture-01",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Session ID Format

Session ID must be a valid UUID (v4 recommended):
```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx

where x is any hex digit and y is 8, 9, A, or B
```

### Duplicate Handling

If the same `sessionId` is submitted multiple times:
- First occurrence: Visitor is recorded
- Subsequent occurrences: Request succeeds but visitor not re-counted

This prevents the same session from incrementing the counter multiple times.

### Security Notes

- Origin must match ALLOWED_ORIGIN
- Session ID must be valid UUID format
- Session ID is random (not fingerprint-based)
- Rate limited to 60 requests per IP per minute
- No personal data collected

---

## GET /api/admin/visitor-count

Get the total number of unique visitors to the lecture.

### Request

**URL:** `GET https://yourdomain.com/api/admin/visitor-count`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_SECRET
```

### Authentication

Requires `Authorization` header with bearer token:

```
Authorization: Bearer YOUR_ADMIN_SECRET
```

The token must match the `ADMIN_SECRET` environment variable set in the worker.

### Response - Success (200)

```json
{
  "lectureId": "lecture-01",
  "visitorCount": 137
}
```

| Field | Type | Description |
|-------|------|-------------|
| `lectureId` | string | The lecture identifier |
| `visitorCount` | number | Total unique visitor sessions |

### Response - Errors

**401 Unauthorized** - Missing authorization header:
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden** - Invalid or incorrect token:
```json
{
  "error": "Invalid credentials"
}
```

**500 Internal Server Error** - Database unavailable:
```json
{
  "error": "Database not available"
}
```

### Example Usage

```bash
curl -H "Authorization: Bearer your-admin-secret" \
  https://yourdomain.com/api/admin/visitor-count
```

### Monitoring Script

```bash
#!/bin/bash
# Monitor visitor count hourly

ADMIN_SECRET="your-admin-secret"
API_URL="https://yourdomain.com"

echo "$(date): Checking visitor count..."

curl -s -H "Authorization: Bearer $ADMIN_SECRET" \
  "$API_URL/api/admin/visitor-count" | jq '.visitorCount'
```

### Security Notes

- Requires valid authorization token
- Token does not expire (stored server-side)
- Response does not include individual session details
- Endpoint not rate-limited (admin use only)
- Not accessible to public visitors

---

## CORS Preflight (OPTIONS)

All endpoints support CORS preflight requests.

### Request

**Method:** `OPTIONS`

**Headers:**
```
Origin: https://yourdomain.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

### Response (204)

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

### Browser Behavior

Browsers automatically send preflight requests before cross-origin POST requests. No manual action needed from client code.

---

## Rate Limiting

The visitor endpoint is rate-limited per client IP address.

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/visit` | 60 requests | 60 seconds |
| `/api/admin/visitor-count` | No limit | - |

### Rate Limit Response

When limit exceeded (429):

**Body:**
```json
{
  "success": false
}
```

**Headers:**
```
Retry-After: 60
```

### Bypassing Rate Limits

Rate limits are per IP address. Users behind the same NAT/proxy share the limit.

For development/testing, rate limits can be adjusted in `worker/src/index.js`:
```javascript
RATE_LIMIT_VISITS_PER_MINUTE: 60,
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | "Invalid request" | Malformed JSON | Check JSON syntax |
| 403 | "Unauthorized origin" | Origin not allowed | Add domain to ALLOWED_ORIGINS |
| 404 | "Lecture not found" | Wrong lecture ID | Use "lecture-01" |
| 429 | Rate limit | Too many requests | Wait 60 seconds |
| 500 | "Internal error" | Server error | Check worker logs |

### Error Logging

Server-side errors are logged to Cloudflare Workers logs:

```bash
wrangler tail --env production
```

---

## Content Types

### Request Content-Type

All endpoints expect:
```
Content-Type: application/json; charset=utf-8
```

Other content types will be rejected with 400.

### Response Content-Type

All responses are JSON:
```
Content-Type: application/json; charset=utf-8
```

---

## Security Headers

All responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control: no-store, max-age=0
```

---

## Changelog

### Version 2.0.0 (YouTube Edition - 2026-09-05)

- Removed video token endpoint (YouTube handles this)
- Kept visitor tracking endpoint
- Simplified architecture
- Removed signing key requirements
- Removed short-lived token logic

### Version 1.0.0 (Cloudflare Stream - Original)

- Full video authorization endpoint
- Complex token management
- Deprecated

---

## Support

For API issues:
1. Check the endpoint URL and HTTP method
2. Verify headers (especially Origin and Content-Type)
3. Check request body JSON syntax
4. Review Cloudflare Worker logs: `wrangler tail`
5. See README.md for common issues
