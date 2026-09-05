# Quick Start Guide (YouTube Edition)

Get the lecture video streaming in 5 minutes locally.

## Prerequisites

- Node.js 18+ installed
- A Cloudflare account
- A YouTube video uploaded as **Unlisted**

## Step 1: Get YouTube Video ID

1. Upload your lecture to YouTube as **Unlisted** (not Private, not Public)
2. Open the video page
3. Copy the URL from the address bar
4. Extract video ID from URL:
   ```
   https://www.youtube.com/watch?v=XXXXXXXXXX
                                   ^^^^^^^^^^
                                  Video ID
   ```

## Step 2: Configure Worker

```bash
cd worker
cp .dev.vars.example .dev.vars
nano .dev.vars
```

Fill in with local values:
```env
ALLOWED_ORIGIN=http://localhost:8080
ADMIN_SECRET=dev-secret
DATABASE_ID=placeholder-for-now
```

## Step 3: Configure Frontend

In `frontend/index.html`, find the `LECTURE_CONFIG`:

```javascript
const LECTURE_CONFIG = {
    id: "lecture-01",
    title: "Introduction to Modern Security Architecture",
    professor: "Dr. Sarah Mitchell",
    date: "2026-09-05",
    duration: "48:32",
    youtubeVideoId: "YOUR_YOUTUBE_VIDEO_ID"  // CHANGE THIS
};
```

Replace `YOUR_YOUTUBE_VIDEO_ID` with your actual YouTube video ID.

Also update the lecture info to match your actual lecture.

## Step 4: Start Worker

```bash
cd worker
npm install
wrangler dev --local
```

Keep this terminal open. Your worker runs at `http://localhost:8787`

## Step 5: Start Frontend

In a new terminal:

```bash
cd frontend
npx http-server -c-1 -p 8080
```

## Step 6: Test

1. Open http://localhost:8080 in browser
2. You should see the YouTube video player
3. Click Play
4. Video should play from YouTube
5. Check browser console (F12) for any errors
6. Open DevTools Network tab to verify requests

## Done!

Your lecture is running locally. Next steps:

- Read README.md for complete documentation
- Read SECURITY.md to understand the security model
- Read DEPLOYMENT.md to go to production

## Common Issues

### Video shows black/won't load
- Check YouTube video ID is exactly right (no spaces, lowercase)
- Verify video is set to Unlisted (not Private)
- Check browser console for errors
- Try clearing browser cache

### CORS error
- Make sure ALLOWED_ORIGIN in .dev.vars is http://localhost:8080
- Restart worker after changing .dev.vars
- Check network tab - look for 403 response

### Worker won't start
```bash
wrangler login
# Then try again
```

### Port already in use
```bash
# Use different port
npx http-server -c-1 -p 8081
# Or kill the process using port 8080
```

## Helpful Commands

```bash
# View worker logs
wrangler tail --local

# Test visitor endpoint
curl -X POST http://localhost:8787/api/visit \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Test admin endpoint
curl -H "Authorization: Bearer dev-secret" \
  http://localhost:8787/api/admin/visitor-count
```

---

**5 minutes to live locally. Next: read README.md for production deployment.**
