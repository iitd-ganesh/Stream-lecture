# Testing Guide

Complete testing procedures for security and functionality.

---

## Unit Tests - Frontend

### Test 1: Session ID Generation

**Objective:** Verify session ID is unique and properly stored

```javascript
// In browser console
sessionStorage.clear();

// First visit
const player = new LecturePlayer(LECTURE_CONFIG);
const sessionId1 = sessionStorage.getItem('lecture-session-id');
console.log('Session ID 1:', sessionId1);

// Verify it's a valid UUID
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
console.assert(uuidRegex.test(sessionId1), 'Session ID is valid UUID');

// Refresh page
location.reload();

// Second visit - should have same ID
const sessionId2 = sessionStorage.getItem('lecture-session-id');
console.log('Session ID 2:', sessionId2);
console.assert(sessionId1 === sessionId2, 'Session ID persists on refresh');

// Clear storage
sessionStorage.clear();

// New session
location.reload();
const sessionId3 = sessionStorage.getItem('lecture-session-id');
console.assert(sessionId1 !== sessionId3, 'New session gets new ID');
```

**Expected Result:** ✓ PASS - All assertions pass

---

### Test 2: API Configuration Validation

**Objective:** Verify API base URL is configured

```javascript
// In browser console
console.assert(
    API_BASE_URL && API_BASE_URL !== 'YOUR_API_BASE_URL',
    'API_BASE_URL is configured'
);

console.assert(
    LECTURE_CONFIG.videoId && LECTURE_CONFIG.videoId !== 'YOUR_CLOUDFLARE_STREAM_VIDEO_ID',
    'Video ID is configured'
);

console.assert(
    LECTURE_CONFIG.id === 'lecture-01',
    'Lecture ID is correct'
);
```

**Expected Result:** ✓ PASS - Configuration is set

---

## Unit Tests - Backend

### Test 3: Origin Validation

**Objective:** Verify CORS origin checking works

```bash
# Test 1: Allowed origin
curl -X POST http://localhost:8787/api/video-token \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01"}' \
  -v

# Check response headers - should include:
# Access-Control-Allow-Origin: http://localhost:8080

# Test 2: Disallowed origin
curl -X POST http://localhost:8787/api/video-token \
  -H "Origin: https://attacker.com" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01"}' \
  -v

# Should return 403 and no Access-Control-Allow-Origin header
```

**Expected Result:** ✓ PASS - Allowed origin gets CORS headers, blocked origin gets 403

---

### Test 4: Lecture ID Validation

**Objective:** Verify only configured lecture can be accessed

```bash
# Valid lecture ID
curl -X POST http://localhost:8787/api/video-token \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01"}'

# Should return 200 with token

# Invalid lecture ID
curl -X POST http://localhost:8787/api/video-token \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-02"}'

# Should return 404
```

**Expected Result:** ✓ PASS - Valid lecture accepted, invalid lecture rejected

---

### Test 5: JSON Validation

**Objective:** Verify request parsing and validation

```bash
# Valid JSON
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Should return 200

# Invalid JSON
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d 'not valid json'

# Should return 400

# Missing fields
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01"}'

# Should return 400
```

**Expected Result:** ✓ PASS - Valid JSON accepted, invalid rejected

---

## Integration Tests

### Test 6: Complete Playback Flow

**Objective:** Verify end-to-end video playback

1. Open http://localhost:8080 in browser
2. Open DevTools → Network tab
3. Refresh page
4. Verify these requests appear:
   - `POST /api/visit` (status 200)
   - `POST /api/video-token` (status 200)
5. Verify player loads (iframe appears)
6. Verify no console errors

**Expected Result:** ✓ PASS - Player loads successfully

---

### Test 7: Visitor Tracking

**Objective:** Verify visitor is recorded once per session

```bash
# Get initial count
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  http://localhost:8787/api/admin/visitor-count

# Note the count (e.g., 5)

# Make visit (simulating browser)
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Get count again
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  http://localhost:8787/api/admin/visitor-count

# Should be 6 (incremented by 1)

# Make same visit again
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Get count again
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  http://localhost:8787/api/admin/visitor-count

# Should still be 6 (NOT incremented)
```

**Expected Result:** ✓ PASS - Count increments once per unique session ID

---

### Test 8: Rate Limiting

**Objective:** Verify rate limiting prevents abuse

```bash
# Make 31 rapid requests (limit is 30)
for i in {1..35}; do
  curl -X POST http://localhost:8787/api/visit \
    -H "Origin: http://localhost:8080" \
    -H "Content-Type: application/json" \
    -d "{\"lectureId\":\"lecture-01\",\"sessionId\":\"session-$i\"}" \
    -w "Request $i: %{http_code}\n"
done

# First 30 should return 200
# Requests 31+ should return 429
```

**Expected Result:** ✓ PASS - Rate limiting engages after 30 requests

---

## Security Tests

### Test 9: No Secrets in Frontend

**Objective:** Verify no credentials in frontend source

```bash
# Search for secrets in frontend files
grep -r "SECRET\|TOKEN\|KEY\|PASSWORD" frontend/ | grep -v "node_modules"

# Search for Cloudflare credentials
grep -r "cloudflare\|CLOUDFLARE" frontend/

# Should find NOTHING sensitive
```

**Expected Result:** ✓ PASS - No credentials found

---

### Test 10: No Secrets in Network

**Objective:** Verify no credentials transmitted

1. Open http://localhost:8080
2. Open DevTools → Network tab
3. Watch all requests
4. Verify no request contains:
   - Signing key
   - API token
   - Database password
   - Worker secret

**Expected Result:** ✓ PASS - No secrets in network requests

---

### Test 11: Security Headers

**Objective:** Verify security headers are present

```bash
curl -I http://localhost:8787/api/video-token

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Strict-Transport-Security: max-age=31536000
```

**Expected Result:** ✓ PASS - All security headers present

---

### Test 12: HTTPS Enforcement

**Objective:** Verify HTTPS is required in production

```bash
# In production, test HTTP → HTTPS redirect
curl -I http://yourdomain.com/api/video-token

# Should redirect to https
```

**Expected Result:** ✓ PASS - HTTP redirects to HTTPS

---

### Test 13: Token Expiration

**Objective:** Verify tokens expire after 30 minutes

1. Get a token: `POST /api/video-token`
2. Copy the token from response
3. Use token immediately - should work
4. Wait 31 minutes
5. Try using same token - should fail

**Expected Result:** ✓ PASS - Expired tokens are rejected

---

### Test 14: Invalid Signature

**Objective:** Verify tampered tokens are rejected

```bash
# Get a valid token
curl -X POST http://localhost:8787/api/video-token \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01"}' \
  | jq '.token' > token.txt

# Tamper with token (change one character)
# Try to use tampered token in player
# Player should reject it

# Or test via direct request
TOKEN=$(cat token.txt)
TAMPERED="${TOKEN%?}X"  # Replace last char

# This would fail in real Cloudflare Stream validation
```

**Expected Result:** ✓ PASS - Tampered tokens are rejected

---

## Performance Tests

### Test 15: Token Generation Speed

**Objective:** Verify token endpoint responds quickly

```bash
# Measure response time
time curl -X POST http://localhost:8787/api/video-token \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01"}'

# Should complete in < 200ms
```

**Expected Result:** ✓ PASS - Token generated in < 200ms

---

### Test 16: Visit Endpoint Speed

**Objective:** Verify visitor tracking is fast

```bash
# Measure response time
time curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Should complete in < 200ms
```

**Expected Result:** ✓ PASS - Visit recorded in < 200ms

---

### Test 17: Page Load Time

**Objective:** Verify frontend loads quickly

1. Open http://localhost:8080
2. Open DevTools → Performance tab
3. Click reload and record
4. Check metrics:
   - DOM Content Loaded: < 1s
   - Load event: < 3s

**Expected Result:** ✓ PASS - Page loads in < 3 seconds

---

## Responsive Design Tests

### Test 18: Desktop Layout

**Objective:** Verify desktop responsiveness

**Viewport:** 1920x1080

- [ ] Header centered
- [ ] Lecture info visible
- [ ] Video player aspect ratio correct (16:9)
- [ ] Player fills available space
- [ ] No horizontal scrolling
- [ ] Text readable

**Expected Result:** ✓ PASS - Layout optimal for desktop

---

### Test 19: Tablet Layout

**Objective:** Verify tablet responsiveness

**Viewport:** 768x1024

- [ ] Header centered
- [ ] Lecture info stacked
- [ ] Video player scales appropriately
- [ ] Controls visible and usable
- [ ] No horizontal scrolling
- [ ] Text readable

**Expected Result:** ✓ PASS - Layout optimal for tablet

---

### Test 20: Mobile Layout

**Objective:** Verify mobile responsiveness

**Viewport:** 375x667

- [ ] Header centered
- [ ] Lecture info stacked vertically
- [ ] Video player maintains 16:9 ratio
- [ ] Controls touch-friendly (large enough)
- [ ] No horizontal scrolling
- [ ] Text readable
- [ ] Player controls accessible

**Expected Result:** ✓ PASS - Layout optimal for mobile

---

## Browser Compatibility Tests

### Test 21: Chrome/Chromium

- [ ] Page loads
- [ ] Player initializes
- [ ] Video plays
- [ ] Controls work
- [ ] Console clean (no errors)

**Expected Result:** ✓ PASS

### Test 22: Firefox

- [ ] Page loads
- [ ] Player initializes
- [ ] Video plays
- [ ] Controls work
- [ ] Console clean (no errors)

**Expected Result:** ✓ PASS

### Test 23: Safari

- [ ] Page loads
- [ ] Player initializes
- [ ] Video plays
- [ ] Controls work
- [ ] Console clean (no errors)

**Expected Result:** ✓ PASS

### Test 24: Safari on iOS

- [ ] Page loads on iPhone
- [ ] Player initializes
- [ ] Video plays in fullscreen
- [ ] Controls accessible
- [ ] Touch controls responsive

**Expected Result:** ✓ PASS

---

## Accessibility Tests

### Test 25: Keyboard Navigation

1. Open page
2. Press Tab repeatedly
3. Verify:
   - [ ] Retry button is focusable
   - [ ] Focus indicator visible
   - [ ] Tab order is logical

**Expected Result:** ✓ PASS - Keyboard navigation works

---

### Test 26: Screen Reader Testing

**Using NVDA (Windows) or JAWS:**

1. Open page
2. Have screen reader read page
3. Verify:
   - [ ] Lecture title announced
   - [ ] Metadata announced
   - [ ] Player announced
   - [ ] Buttons labeled
   - [ ] Error messages announced

**Expected Result:** ✓ PASS - Screen reader compatible

---

### Test 27: Color Contrast

Using DevTools or WebAIM:

- [ ] Text contrast ratio ≥ 4.5:1 for body text
- [ ] Text contrast ratio ≥ 3:1 for large text
- [ ] Buttons have sufficient contrast

**Expected Result:** ✓ PASS - WCAG AA contrast compliance

---

## Admin Endpoint Tests

### Test 28: Admin Authentication

**Without token:**
```bash
curl http://localhost:8787/api/admin/visitor-count

# Should return 401 Unauthorized
```

**With invalid token:**
```bash
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8787/api/admin/visitor-count

# Should return 403 Forbidden
```

**With valid token:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  http://localhost:8787/api/admin/visitor-count

# Should return 200 with visitor count
```

**Expected Result:** ✓ PASS - Authentication required and enforced

---

### Test 29: Admin Visitor Count Response

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  http://localhost:8787/api/admin/visitor-count

# Response should be valid JSON:
# {
#   "lectureId": "lecture-01",
#   "visitorCount": 42
# }

# Verify:
# - lectureId is correct
# - visitorCount is a number
# - No sensitive data exposed
```

**Expected Result:** ✓ PASS - Response format correct

---

## Test Summary Checklist

Print this and check off as you go:

### Frontend Tests
- [ ] Test 1: Session ID generation
- [ ] Test 2: API configuration
- [ ] Test 9: No secrets in frontend
- [ ] Test 10: No secrets in network
- [ ] Test 15: Token speed
- [ ] Test 16: Visit speed
- [ ] Test 17: Page load time
- [ ] Test 18: Desktop layout
- [ ] Test 19: Tablet layout
- [ ] Test 20: Mobile layout
- [ ] Test 21: Chrome compatibility
- [ ] Test 22: Firefox compatibility
- [ ] Test 23: Safari compatibility
- [ ] Test 24: iOS compatibility
- [ ] Test 25: Keyboard navigation
- [ ] Test 26: Screen reader
- [ ] Test 27: Color contrast

### Backend Tests
- [ ] Test 3: Origin validation
- [ ] Test 4: Lecture ID validation
- [ ] Test 5: JSON validation
- [ ] Test 11: Security headers
- [ ] Test 12: HTTPS enforcement
- [ ] Test 28: Admin authentication
- [ ] Test 29: Admin response

### Integration Tests
- [ ] Test 6: Complete playback flow
- [ ] Test 7: Visitor tracking
- [ ] Test 8: Rate limiting
- [ ] Test 13: Token expiration
- [ ] Test 14: Invalid signature

---

**Total Tests:** 29
**Recommended Frequency:**
- Before each deployment: Run all tests
- Weekly during operation: Run security tests
- Monthly: Run full compatibility test suite
