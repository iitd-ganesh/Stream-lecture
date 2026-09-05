# Secure Single-Lecture Video Website (YouTube Edition)

A production-ready website for hosting exactly ONE lecture video using an unlisted YouTube video.

**Key Features:**
- Unlisted YouTube video (not searchable, only accessible via direct link)
- Anonymous visitor counting
- Zero login or authentication required
- Clean, responsive academic design
- HTTPS-only with security headers
- Rate limiting and CORS protection
- YouTube handles video delivery and security

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        VISITOR                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Static HTML)                    │
│              • index.html, style.css, app.js                │
│           • Displays YouTube video                          │
│           • Tracks anonymous session                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌───────────────┐   ┌──────────────┐
            │  /api/visit   │   │   YouTube    │
            └───────────────┘   │   (iframe)   │
                    │           └──────────────┘
                    ▼
    ┌─────────────────────────────────────────┐
    │    CLOUDFLARE WORKER (Backend)          │
    │  • Validates origin                     │
    │  • Rate limits                          │
    │  • Records visitor sessions             │
    └─────────────────────────────────────────┘
                    │
            ┌───────┴──────┐
            ▼              ▼
    ┌──────────────┐  ┌────────────────┐
    │ Cloudflare   │  │  Admin API     │
    │     D1       │  │  (Protected)   │
    │              │  │                │
    │ • session_id │  │ • Returns      │
    │ • lecture_id │  │   visitor count│
    │ • timestamp  │  │                │
    └──────────────┘  └────────────────┘
```

---

## Prerequisites

- **YouTube Account** with an unlisted lecture video uploaded
- **Cloudflare Account** with:
  - Workers enabled
  - D1 database enabled
- **Domain** (for production deployment)
- **Node.js** 18+ (for local development)

---

## Quick Start (5 Minutes)

### 1. Get Your YouTube Video ID

1. Upload your lecture to YouTube as **Unlisted** (not Private, not Public)
2. Open the video
3. Click Share → Copy the URL
4. Extract the video ID from the URL:
   - URL: `https://www.youtube.com/watch?v=abc123xyz`
   - Video ID: `abc123xyz`

### 2. Configure Worker

```bash
cd worker
cp .dev.vars.example .dev.vars
nano .dev.vars
```

Fill in:
```env
ALLOWED_ORIGIN=http://localhost:8080
ADMIN_SECRET=dev-secret-change-this
DATABASE_ID=placeholder-for-dev
```

### 3. Update Frontend

Edit `frontend/index.html` and find this section:

```javascript
const LECTURE_CONFIG = {
    youtubeVideoId: "YOUR_YOUTUBE_VIDEO_ID"
};
```

Replace `YOUR_YOUTUBE_VIDEO_ID` with your actual YouTube video ID.

### 4. Update Lecture Info

In `frontend/index.html`, update:
```html
<h1 class="lecture-title">YOUR LECTURE TITLE</h1>
<!-- ... -->
<span class="meta-value">YOUR PROFESSOR NAME</span>
<!-- ... -->
<span class="meta-value">YOUR DATE</span>
<!-- ... -->
<span class="meta-value">YOUR DURATION</span>
```

### 5. Start Locally

```bash
# Terminal 1: Start worker
npm install
wrangler dev --local

# Terminal 2: Start frontend
cd ../frontend
npx http-server -c-1 -p 8080
```

Open http://localhost:8080 in browser

---

## YouTube Setup

### Create Unlisted Video

1. Go to https://youtube.com
2. Click your profile icon → Create a video or post
3. Upload your lecture file
4. Keep it in **Unlisted** status (important - not Private, not Public)
5. Add title, description, thumbnail
6. Click Publish
7. Copy the video ID from the URL

### Why Unlisted?

- **Unlisted videos** are only accessible via direct link
- Not searchable in YouTube
- Cannot be found via YouTube search or recommendations
- Share only the link with intended viewers
- YouTube handles video security and delivery

### Video Controls

YouTube's built-in player provides:
- ✓ Play/Pause
- ✓ Progress bar
- ✓ Volume control
- ✓ Mute button
- ✓ Fullscreen
- ✓ Speed controls
- ✓ Closed captions (if enabled)

No download or share buttons visible to viewers.

---

## Development

### Project Structure

```
secure-lecture-website/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── worker/
│   ├── src/index.js
│   ├── wrangler.toml
│   └── .dev.vars.example
├── database/
│   └── schema.sql
└── README.md
```

### API Endpoints

**POST /api/visit**
```bash
curl -X POST http://localhost:8787/api/visit \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{
    "lectureId": "lecture-01",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**GET /api/admin/visitor-count** (protected)
```bash
curl -H "Authorization: Bearer dev-secret-change-this" \
  http://localhost:8787/api/admin/visitor-count
```

---

## Production Deployment

### 1. Create D1 Database

```bash
cd worker
wrangler d1 create lecture_db_production
# Copy the DATABASE_ID from output
```

### 2. Apply Database Schema

```bash
wrangler d1 execute lecture_db_production \
  --file=../database/schema.sql \
  --remote
```

### 3. Set Production Secrets

```bash
wrangler secret put ALLOWED_ORIGIN --env production
# Enter: https://yourdomain.com

wrangler secret put ADMIN_SECRET --env production
# Enter: secure-random-secret

wrangler secret put DATABASE_ID --env production
# Enter: your-database-id
```

### 4. Update wrangler.toml

Replace `yourdomain.com` and database IDs with your actual values.

### 5. Deploy Worker

```bash
wrangler deploy --env production
```

### 6. Deploy Frontend

Choose one:

**Cloudflare Pages:**
```bash
cd ../frontend
wrangler pages publish . --project-name=lecture
```

**GitHub Pages:**
```bash
npm run deploy:pages
```

**Other hosts:** Upload `frontend/` directory

### 7. Configure DNS

```dns
yourdomain.com → your-hosting-provider (CNAME or A record)
api.yourdomain.com → secure-lecture-worker.{account}.workers.dev (CNAME)
```

### 8. Update Frontend API

Edit deployed `frontend/app.js` or update configuration to point to your API URL.

---

## Testing

### Local Test

1. Open http://localhost:8080
2. Verify video loads
3. Verify play works
4. Check DevTools console for errors
5. Verify visitor count increments

### Security Test

```bash
# Test API with correct origin
curl -H "Origin: http://localhost:8080" \
  -X POST http://localhost:8787/api/visit \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'
# Should return 200

# Test API with wrong origin
curl -H "Origin: https://attacker.com" \
  -X POST http://localhost:8787/api/visit \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'
# Should return 403
```

### Production Test

1. Open https://yourdomain.com
2. Video should load
3. Play should work
4. Check DevTools Network tab - all requests HTTPS
5. Test admin count endpoint

---

## Monitoring

### Check Visitor Count

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://yourdomain.com/api/admin/visitor-count
```

### View Worker Logs

```bash
wrangler tail --env production
```

### Check Database

```bash
wrangler d1 query lecture_db_production \
  "SELECT COUNT(*) as visitors FROM lecture_visits;" \
  --remote
```

---

## Security Model

### What's Protected

- ✓ Admin secret (server-side only)
- ✓ Database credentials (Worker binding)
- ✓ Visitor privacy (anonymous sessions)
- ✓ CORS origin restrictions
- ✓ HTTPS enforcement
- ✓ Rate limiting

### What's NOT Protected

- ⚠ YouTube video is unlisted (accessible by link)
- ⚠ YouTube video URL appears in HTML source
- ⚠ YouTube handles video delivery
- ⚠ Determined users can copy video from YouTube

### Why This Works

- YouTube unlisted videos require direct link access
- Not discoverable via search
- Share link only with intended viewers
- YouTube's infrastructure handles security
- Simpler than custom encryption

---

## Visitor Counting

### How It Works

1. Visitor opens page
2. Browser generates random session ID
3. Session ID stored in sessionStorage
4. Visit recorded in D1 (once per session)
5. Refresh page = same session (no double count)
6. Clear browser storage = new session

### Admin Access

Get visitor count via protected endpoint:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://yourdomain.com/api/admin/visitor-count

# Response:
# {
#   "lectureId": "lecture-01",
#   "visitorCount": 137
# }
```

---

## Troubleshooting

### Video won't load

- Verify YouTube video ID is correct in config
- Verify video is Unlisted (not Private)
- Check browser console for errors
- Verify `youtubeVideoId` value is set

### CORS errors

- Verify `ALLOWED_ORIGIN` in .dev.vars matches your domain
- Restart worker after changing .dev.vars
- Check response headers have `Access-Control-Allow-Origin`

### Visitor count not working

- Verify database is created and bound
- Check worker logs: `wrangler tail`
- Verify schema was applied: `wrangler d1 query lecture_db_production "SELECT COUNT(*) FROM lecture_visits;" --remote`

### Rate limiting too strict

- Limits are: 60 visits/minute per IP
- Adjust in `worker/src/index.js` if needed
- Redeploy after changes

---

## Configuration Summary

### YouTube Video ID
- From unlisted YouTube video URL
- Example: `dQw4w9WgXcQ`
- Set in `frontend/index.html`

### Domain
- Your custom domain or pages.dev
- Set in ALLOWED_ORIGIN env var
- Update DNS to point there

### Admin Secret
- Generated random string
- Set in ADMIN_SECRET env var
- Use to access visitor count
- Change regularly in production

### Database ID
- Generated when creating D1
- Set in DATABASE_ID env var
- Stores visitor sessions

---

## Checklist Before Launch

- [ ] YouTube video uploaded as Unlisted
- [ ] YouTube video ID copied
- [ ] Worker configured with ALLOWED_ORIGIN
- [ ] Frontend configured with YouTube video ID
- [ ] Lecture info (title, professor, date) updated
- [ ] Local test successful
- [ ] D1 database created
- [ ] Worker deployed to production
- [ ] Frontend deployed to production
- [ ] DNS configured
- [ ] Production test successful
- [ ] Admin secret changed from default

---

## File Configuration Quick Reference

### frontend/index.html
```javascript
const LECTURE_CONFIG = {
    youtubeVideoId: "YOUR_ACTUAL_YOUTUBE_VIDEO_ID"  // Set this
};
```

### worker/.dev.vars (local)
```env
ALLOWED_ORIGIN=http://localhost:8080
ADMIN_SECRET=dev-secret
DATABASE_ID=placeholder
```

### worker/.env (production)
```env
ALLOWED_ORIGIN=https://yourdomain.com
ADMIN_SECRET=your-secure-secret
DATABASE_ID=your-actual-id
```

---

## Support

For issues:
1. Check YouTube video is Unlisted
2. Verify video ID format (no `v=` prefix)
3. Check browser console for errors
4. Check worker logs: `wrangler tail`
5. Verify CORS origin matches exactly
6. Try private/incognito window

---

**Your YouTube-based lecture website is ready to deploy.**

For detailed documentation, see:
- SECURITY.md - Security model
- API.md - Endpoint reference
- DEPLOYMENT.md - Production guide
- TESTING.md - Test procedures
#   S t r e a m - l e c t u r e  
 