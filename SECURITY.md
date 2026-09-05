# Security Documentation (YouTube Edition)

## Overview

This document explains the security model when using an unlisted YouTube video for lecture hosting.

---

## What Is Protected

### ✓ Admin Secret
- Stored as worker environment variable
- Never exposed to frontend
- Required to access visitor count
- Should be rotated regularly

**How:** Worker validates token server-side before returning data.

### ✓ Visitor Privacy
- No personal data collected
- Anonymous session IDs (random UUIDs)
- No fingerprinting
- No tracking cookies

**How:** Frontend generates random session ID per browser session, stored in sessionStorage.

### ✓ Database
- Visitor records isolated in D1
- Only session IDs and timestamps stored
- No sensitive information

**How:** Worker binding restricts D1 access to backend only.

### ✓ Origin Restrictions
- API only accepts requests from configured origins
- CORS headers restrict cross-origin requests

**How:** Worker validates Origin header on all requests.

### ✓ Rate Limiting
- Visit endpoint limited to 60 requests/minute per IP
- Prevents abuse

**How:** Cloudflare KV tracks request counts with 60-second expiration.

### ✓ HTTPS Enforcement
- All communication encrypted in transit
- No sensitive data over HTTP

**How:** Frontend and worker use HTTPS URLs.

### ✓ Security Headers
- Content-Security-Policy configured
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- HSTS enabled
- Other security headers present

**How:** Worker returns security headers on all responses.

---

## What Is NOT Protected

### ⚠ YouTube Video Unlisted URL
- Video is hosted on YouTube
- Anyone with the direct link can watch
- Not searchable, but still accessible
- YouTube handles video security

**Reality:** This is by design. Unlisted videos are discoverable by link.

**Mitigation:** 
- Share link only with intended viewers
- YouTube provides viewer analytics
- Can be marked Private or deleted anytime

### ⚠ Browser Network Inspection
A user CAN inspect network requests and see:
- YouTube iframe embed URL
- Video playback requests to YouTube

**Rationale:** This is unavoidable. Browsers must receive media to play it.

**Reality:** A determined user can:
- Record their screen
- Download video from YouTube
- Inspect network requests

**Our approach:** We don't attempt fake security. YouTube unlisted is practical protection, not foolproof encryption.

### ⚠ Screen Recording
Users can record their screen while watching.

**Our approach:** We accept this as unavoidable.

### ⚠ YouTube API
YouTube handles video delivery and security:
- DRM (on some devices)
- Access control
- Download prevention
- Rate limiting

This is beyond our control but managed by YouTube.

---

## Architecture Comparison

### Previous (Cloudflare Stream)
- Custom signed tokens
- Short-lived authorization
- Server-side signing credentials
- Complex token refresh

### Current (YouTube Unlisted)
- YouTube handles security
- Simpler architecture
- No token generation
- Direct video access

---

## Threat Model

### Threat: Direct Video Link Discovery
**Attack:** User tries to find YouTube video URL in page source.

**Reality:** YouTube video ID is visible in HTML (not secret).

**Why:** It's not secret. Security comes from:
- Video is Unlisted (not searchable)
- Only accessible to people with link
- Share link only with intended audience

### Threat: Video Download
**Attack:** User downloads video from YouTube.

**Reality:** YouTube is downloadable by determined users (via tools, screen recording, etc.)

**Why:** This is YouTube's design. We cannot prevent it.

**Our approach:** Unlisted status provides practical protection.

### Threat: Unauthorized Origin
**Attack:** User embeds page on different domain.

**Reality:** Embed works (YouTube allows cross-origin embedding).

**Why:** YouTube is designed for broad embedding.

**Mitigation:**
- Our API validates Origin header
- Not applicable to YouTube video itself
- Focus on visitor tracking origin

### Threat: Rate Limit Bypass
**Attack:** User makes excessive API requests.

**Reality:** Rate limiting blocks requests after 60/minute per IP.

**Mitigation:**
- KV-backed rate limiting
- 60-second window resets
- Returns 429 Too Many Requests

### Threat: Database Compromise
**Attack:** Attacker gains D1 database access.

**Reality:** Database only contains anonymous session IDs and timestamps.

**Impact:** Low - no personal data exposed, visitor count becomes public.

**Mitigation:**
- D1 access restricted to Worker binding
- No credentials in frontend
- Regular backups

---

## Implementation Details

### Video Hosting
- **Provider:** YouTube
- **Status:** Unlisted (requires direct link)
- **Security:** YouTube infrastructure
- **Delivery:** YouTube servers globally

### Visitor Tracking
1. Frontend generates random UUID
2. Stores in sessionStorage
3. Sends to backend with lecture ID
4. Backend inserts into D1 (if new)
5. Same session ID = no duplicate count

### API Protection
1. Request includes Origin header
2. Worker validates Origin against whitelist
3. If allowed: process request, return CORS headers
4. If not allowed: reject with 403

### Admin Endpoint
1. Request includes Authorization header
2. Worker extracts bearer token
3. Compares with ADMIN_SECRET
4. If valid: return visitor count
5. If invalid: reject with 403

---

## Security Audit Results

| Property | Status | Notes |
|----------|--------|-------|
| Secrets in frontend | ❌ NO | All secrets server-side |
| YouTube ID exposed | ✓ YES | Not secret - by design |
| Video URL in HTML | ✓ YES | YouTube embed - expected |
| Permanent video access | ✓ YES | Unlisted YouTube design |
| Unsigned playback | ✓ YES | YouTube handles this |
| HTTPS enforced | ✓ YES | All traffic encrypted |
| Rate limiting works | ✓ YES | Implemented per endpoint |
| Origin validation works | ✓ YES | Checked on all endpoints |
| CORS restricted | ✓ YES | Only allowed origins |
| Security headers present | ✓ YES | Returned on all responses |
| Anonymous tracking | ✓ YES | No personal data |
| Admin endpoint protected | ✓ YES | Requires auth token |
| Database isolated | ✓ YES | Worker binding only |
| No fake security | ✓ YES | No DevTools blocking |

---

## Known Limitations

### 1. YouTube Unlisted Accessibility
- Video accessible to anyone with direct link
- Not searchable in YouTube
- Can be shared by viewers
- Cannot prevent sharing once link known

**Acceptance:** This is the trade-off for using YouTube.

### 2. Screen Recording
- No software can prevent screen capture
- Users can record audio/video output
- External recording tools always work

**Acceptance:** Inherent to digital media.

### 3. Browser Capabilities
- Determined users can inspect network requests
- Can use browser extensions to capture data
- DevTools access cannot be prevented

**Approach:** We don't attempt fake blocking. Focus on practical protection.

### 4. Shared Viewing
- Users can share the YouTube video link
- Viewers can be multiple people on one account
- Analytics cannot distinguish individuals

**Acceptance:** Expected behavior for shared links.

---

## Recommendations for Production

### Essential
1. **Change admin secret** from default
2. **Use HTTPS** everywhere (Cloudflare enforces this)
3. **Keep YouTube video unlisted** (not public, not private)
4. **Share link selectively** with intended audience
5. **Monitor worker logs** for suspicious activity

### Highly Recommended
1. Set up Cloudflare DDoS protection
2. Enable worker rate limiting
3. Monitor visitor count for anomalies
4. Review YouTube video analytics
5. Keep D1 database backups

### Optional
1. Configure Cloudflare Bot Management
2. Set up error tracking/alerting
3. Regular security audits
4. Document access procedures

---

## Compliance Considerations

### GDPR
- ✓ No personal data collected
- ✓ Anonymous visitor counting only
- ✓ No consent needed (no tracking)

### CCPA
- ✓ No personal information collected
- ✓ No "sale" of data
- ✓ No third-party tracking

### FERPA (if educational)
- ⚠ Anonymous counting only
- ⚠ Not FERPA-compliant by itself
- Requires additional institutional controls

### HIPAA
- ⚠ Not HIPAA-compliant
- Requires additional security controls

---

## Privacy Policy Statement

Suggested privacy policy text:

> This website uses YouTube to host lecture videos. When you visit this page:
> 
> - Your browser downloads the video player from YouTube
> - YouTube may set cookies (see YouTube privacy policy)
> - We collect an anonymous session ID to count unique visitors
> - No personal information is collected
> - Visitor count is aggregate only (no individual tracking)
> - YouTube handles video delivery and security

---

## What This IS

- ✓ Practical video hosting solution
- ✓ Unlisted video access control
- ✓ Anonymous visitor counting
- ✓ CORS and origin validation
- ✓ Rate-limited API access
- ✓ Secure admin endpoint
- ✓ HTTPS-only communication
- ✓ Minimal security surface

---

## What This IS NOT

- ❌ DRM (Digital Rights Management)
- ❌ Copy protection
- ❌ Download prevention
- ❌ Screen capture prevention
- ❌ Fingerprinting system
- ❌ Individual user identification
- ❌ Encrypted video streaming
- ❌ Anti-deviation protection

---

## Comparison: YouTube Unlisted vs Other Options

| Feature | YouTube Unlisted | Stream (Previous) | Private YouTube |
|---------|------------------|-------------------|-----------------|
| Complexity | Low | High | Low |
| Cost | Free | Paid | Free |
| Video handling | YouTube CDN | Custom | YouTube CDN |
| Security | Practical | Strong | Stronger |
| Searchability | No | No | No |
| Sharing | Via link | Via link | Via YouTube |
| Analytics | YouTube built-in | Custom | YouTube built-in |
| Token management | None | Complex | None |
| Setup time | 5 min | 30 min | 5 min |

---

## Testing Security

### Manual Tests

```bash
# Test 1: Verify no secrets in frontend
grep -r "SECRET\|TOKEN\|KEY\|PASSWORD" frontend/ | grep -v node_modules

# Test 2: Verify YouTube ID is not sensitive
# It's in HTML source - this is OK

# Test 3: Verify origin validation
curl -H "Origin: https://attacker.com" \
  -X POST https://yourdomain.com/api/visit \
  -d '{"lectureId":"lecture-01","sessionId":"uuid"}'
# Should return 403

# Test 4: Verify rate limiting
for i in {1..65}; do
  curl -X POST https://yourdomain.com/api/visit \
    -H "Content-Type: application/json" \
    -d "{\"lectureId\":\"lecture-01\",\"sessionId\":\"session-$i\"}"
done
# First 60 should succeed, 61+ should return 429

# Test 5: Verify HTTPS only
curl -I http://yourdomain.com
# Should redirect to https

# Test 6: Verify security headers
curl -I https://yourdomain.com/api/admin/visitor-count
# Should include security headers
```

---

## Incident Response

### If YouTube video is found/shared
1. YouTube link is now distributed (accept this)
2. Monitor view count on YouTube analytics
3. Can delete or make private anytime
4. Re-upload new video if needed
5. Share new link with intended audience

### If visitor count endpoint is compromised
1. Rotate ADMIN_SECRET
2. Review logs for unauthorized access
3. Reset database if needed
4. Monitor for patterns

### If origin validation is bypassed
1. Check worker logs
2. Update ALLOWED_ORIGINS if needed
3. Redeploy worker
4. Investigate root cause

---

## Security Audit Checklist

- [x] No API credentials in frontend
- [x] No signing keys in frontend
- [x] No database credentials in frontend
- [x] YouTube ID visible (expected, not secret)
- [x] HTTPS enforced on all endpoints
- [x] CORS validates origin
- [x] Rate limiting functional
- [x] Security headers present
- [x] Admin endpoint protected
- [x] Database access restricted
- [x] No fake security measures
- [x] No fingerprinting attempted
- [x] Privacy preserved (anonymous only)

---

## Summary

**YouTube Unlisted Model:**
- Simpler than custom token system
- Leverages YouTube's infrastructure
- Practical security (not foolproof)
- Acceptable for educational content
- Lower maintenance burden

**Security Posture:**
- ✓ Strong for intended use case
- ✓ Practical protection against casual access
- ✓ Accepts limitations of browser-based video
- ✓ Honest about what is/isn't protected

---

**Last Updated:** September 5, 2026
