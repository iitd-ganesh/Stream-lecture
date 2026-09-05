# Configuration Guide (YouTube Edition)

This guide walks through configuring the YouTube-based lecture system step-by-step.

## Step 1: Prepare Your YouTube Video

### 1.1 Upload to YouTube

1. Go to https://youtube.com
2. Click your profile icon → Create a video or post
3. Click "Upload videos"
4. Select your lecture video file
5. Wait for processing (usually 1-5 minutes)

### 1.2 Set to Unlisted

**IMPORTANT:** Set video status to **Unlisted** (not Public, not Private)

1. After upload, go to Video Details
2. Find "Visibility" section
3. Select "Unlisted"
4. Save changes

**Why Unlisted?**
- Not searchable in YouTube
- Only accessible via direct link
- Perfect for course/lecture access control
- Better than Private (Private requires YouTube login)

### 1.3 Get Video ID

1. Open your uploaded video
2. Look at the URL in address bar
3. Extract the video ID:
   ```
   https://www.youtube.com/watch?v=abc123xyz
                                  ^^^^^^^^^^
                                Video ID
   ```
4. Save this ID for later (e.g., in a text file)

### 1.4 Optional: Customize Video

In YouTube Studio:
- Add description with lecture details
- Enable/disable comments
- Enable/disable likes/dislikes
- Add transcription if available
- Add video chapter markers (optional)

---

## Step 2: Gather Cloudflare Information

You'll need:
- Cloudflare Account ID (for worker authentication)
- Domain name (where your website will be hosted)

### 2.1 Get Account ID

1. Go to https://dash.cloudflare.com
2. Click on any domain or Account Home
3. Right sidebar shows "Account ID"
4. Copy this value

### 2.2 Get API Token (if not already done)

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Workers"
4. Click "Create Token"
5. Copy the token value
6. Run: `wrangler login` and paste it

---

## Step 3: Local Development Setup

### 3.1 Install Tools

```bash
# Install Node.js from https://nodejs.org/ (18+)
node --version
npm --version

# Install Wrangler globally
npm install -g wrangler@3
wrangler --version
```

### 3.2 Authenticate with Cloudflare

```bash
wrangler login
# Paste your API token when prompted
```

### 3.3 Clone/Copy Project

```bash
cd /path/to/project
# Or create from scratch with these files
```

### 3.4 Create D1 Database (Local Development)

For local testing, you don't need a database yet. Skip to Step 4.

---

## Step 4: Frontend Configuration

### 4.1 Update HTML

Edit `frontend/index.html` and find this section:

```javascript
const LECTURE_CONFIG = {
    id: "lecture-01",
    title: "Introduction to Modern Security Architecture",
    professor: "Dr. Sarah Mitchell",
    date: "2026-09-05",
    duration: "48:32",
    youtubeVideoId: "YOUR_YOUTUBE_VIDEO_ID"
};
```

**Replace these values:**
- `title`: Your actual lecture title
- `professor`: Your professor name
- `date`: Lecture date (YYYY-MM-DD format)
- `duration`: Video duration (MM:SS format)
- `youtubeVideoId`: The YouTube video ID from Step 1.3

**Example:**
```javascript
const LECTURE_CONFIG = {
    id: "lecture-01",
    title: "Advanced Network Security",
    professor: "Dr. Jane Smith",
    date: "2026-09-05",
    duration: "52:15",
    youtubeVideoId: "dQw4w9WgXcQ"
};
```

### 4.2 Update HTML Metadata

In the same file, update the lecture header HTML:

```html
<h1 class="lecture-title">YOUR LECTURE TITLE HERE</h1>
<!-- ... -->
<span class="meta-value">YOUR PROFESSOR NAME</span>
<!-- ... -->
<span class="meta-value">YOUR DATE</span>
<!-- ... -->
<span class="meta-value">YOUR DURATION</span>
```

---

## Step 5: Worker Configuration

### 5.1 Create .dev.vars

```bash
cd worker
cp .dev.vars.example .dev.vars
```

### 5.2 Edit .dev.vars

For **local development**, use:

```env
ALLOWED_ORIGIN=http://localhost:8080
ADMIN_SECRET=dev-secret-change-this
DATABASE_ID=placeholder-for-dev
```

For **production**, you'll change these later.

### 5.3 Test Worker Locally

```bash
npm install
wrangler dev --local
```

You should see:
```
⛅ wrangler 3.x.x
✓ Ready on http://localhost:8787
```

Open another terminal and test:

```bash
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'
```

Should return: `{"success":true}`

---

## Step 6: Test Locally

### 6.1 Start Frontend

In a new terminal:

```bash
cd frontend
npx http-server -c-1 -p 8080
```

You should see:
```
Hit CTRL-C to stop the server
http://127.0.0.1:8080
```

### 6.2 Open in Browser

1. Go to http://localhost:8080
2. You should see lecture page with YouTube player
3. YouTube player should load the video
4. Click Play - video should play
5. Press F12 to open DevTools
6. Check Console tab - should be clean (no errors)
7. Check Network tab - verify requests working

### 6.3 Verify Functionality

- [ ] Page loads
- [ ] Lecture info displays
- [ ] YouTube player visible
- [ ] Play button works
- [ ] Volume controls work
- [ ] No console errors
- [ ] Visitor tracking endpoint called

---

## Step 7: Prepare for Production

### 7.1 Collect Production Values

You'll need:
- [ ] Your domain name (e.g., yourdomain.com)
- [ ] Database ID (get after creating D1)
- [ ] Secure admin secret (generate one)

### 7.2 Generate Admin Secret

```bash
# Generate a secure random string
openssl rand -hex 32

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8

# Use this as your ADMIN_SECRET in production
```

### 7.3 Update wrangler.toml

Edit `worker/wrangler.toml` and update these sections:

```toml
[env.production]
routes = [
    { pattern = "yourdomain.com/api/*", zone_name = "yourdomain.com" }
]

[[d1_databases]]
binding = "DB"
database_name = "lecture_db"
database_id = "YOUR_PRODUCTION_DATABASE_ID"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "YOUR_KV_NAMESPACE_ID"
```

Replace:
- `yourdomain.com` with your actual domain
- `YOUR_PRODUCTION_DATABASE_ID` with your D1 ID (get this in Step 8)
- `YOUR_KV_NAMESPACE_ID` with your KV namespace ID

---

## Step 8: Production Setup (Cloudflare)

### 8.1 Create D1 Database

```bash
wrangler d1 create lecture_db_production

# Output shows:
# 🎉 Created database 'lecture_db_production' with ID: abc123def456
# Copy the database ID
```

### 8.2 Apply Database Schema

```bash
wrangler d1 execute lecture_db_production \
  --file=../database/schema.sql \
  --remote

# Verify:
wrangler d1 query lecture_db_production \
  "SELECT name FROM sqlite_master WHERE type='table';" \
  --remote

# Should show: lecture_visits
```

### 8.3 Set Production Secrets

```bash
# Set Allowed Origin (your domain)
wrangler secret put ALLOWED_ORIGIN --env production
# Type: https://yourdomain.com

# Set Admin Secret (the one you generated)
wrangler secret put ADMIN_SECRET --env production
# Type: the secure string from Step 7.2

# Set Database ID
wrangler secret put DATABASE_ID --env production
# Type: the ID from Step 8.1
```

### 8.4 Deploy Worker

```bash
wrangler deploy --env production

# Output shows:
# Uploaded secure-lecture-worker successfully to yourdomain.com/api/*
# https://secure-lecture-worker.YOUR_ACCOUNT.workers.dev
```

---

## Step 9: Deploy Frontend

### Option A: Cloudflare Pages (Recommended)

```bash
cd frontend
wrangler pages publish . --project-name=lecture

# Output shows deployment URL
```

### Option B: GitHub Pages

```bash
cd frontend
npm install gh-pages
npm run deploy:pages

# Follow GitHub Pages setup instructions
```

### Option C: Netlify

```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=.
```

### Option D: Other Host

Upload `frontend/` directory to your static host (AWS S3, Azure, etc.)

---

## Step 10: Configure Domain

### 10.1 Point Domain to Frontend

If using **Cloudflare Pages:**
- Create CNAME: yourdomain.com → pages.dev subdomain

If using **GitHub Pages:**
- Create CNAME: yourdomain.com → your-github.io

If using **other host:**
- Follow their instructions

### 10.2 Point API Subdomain

```dns
api.yourdomain.com CNAME secure-lecture-worker.YOUR_ACCOUNT.workers.dev
```

Or use worker routes configured in wrangler.toml.

### 10.3 Verify DNS

```bash
nslookup yourdomain.com
nslookup api.yourdomain.com

# Should resolve to your hosts
```

Wait for DNS to propagate (up to 48 hours, usually faster).

---

## Step 11: Update Frontend for Production

Once deployed, update the API base URL if needed.

In `frontend/app.js`, the `getApiBaseUrl()` method handles this:

```javascript
getApiBaseUrl() {
    // Local development
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:8787';
    }
    
    // Production - use same domain
    return `${window.location.protocol}//${window.location.host}`;
}
```

This automatically uses your production domain.

---

## Step 12: Verify Production

### 12.1 Test Website

1. Open https://yourdomain.com in browser
2. Verify page loads (should redirect from http to https)
3. Verify YouTube video loads
4. Click Play - should play
5. Press F12 → Console - should be clean
6. Press F12 → Network - verify requests

### 12.2 Test API

```bash
# Test visitor endpoint
curl -X POST https://yourdomain.com/api/visit \
  -H "Origin: https://yourdomain.com" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Should return: {"success":true}

# Test admin endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://yourdomain.com/api/admin/visitor-count

# Should return visitor count
```

### 12.3 Test Security

```bash
# Test wrong origin (should fail)
curl -H "Origin: https://attacker.com" \
  -X POST https://yourdomain.com/api/visit \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"test"}'

# Should return 403

# Verify HTTPS redirect
curl -I http://yourdomain.com

# Should redirect to https
```

---

## Summary Checklist

- [ ] YouTube video uploaded as Unlisted
- [ ] YouTube video ID extracted
- [ ] Frontend configured with video ID
- [ ] Frontend lecture info updated
- [ ] Worker configured for local dev
- [ ] Local testing successful
- [ ] D1 database created
- [ ] Worker deployed to production
- [ ] Frontend deployed to production
- [ ] Domain configured and DNS propagated
- [ ] Production testing successful
- [ ] Admin secret changed from default

---

## Troubleshooting

### YouTube video won't load
- Verify video is set to Unlisted (not Private or Public)
- Verify video ID is correct (no spaces, exactly right)
- Try opening YouTube video directly to confirm it works

### CORS errors
- Verify ALLOWED_ORIGIN matches your domain exactly
- Include the Origin header in test requests
- Restart worker after changing .dev.vars

### Worker won't deploy
- Run `wrangler login` and re-authenticate
- Check for syntax errors: `npm run lint`
- Try deploying with verbose: `wrangler deploy --env production --verbose`

### Database not working
- Verify schema was applied: `wrangler d1 query lecture_db_production "SELECT name FROM sqlite_master WHERE type='table';" --remote`
- Check worker logs: `wrangler tail --env production`

### Domain not working
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records with: `nslookup yourdomain.com`
- Check browser cache: try incognito window

---

**Configuration complete!** Your YouTube-based lecture website is ready.
