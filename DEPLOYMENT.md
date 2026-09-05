# Deployment Guide (YouTube Edition)

Complete step-by-step guide to deploy the YouTube-based lecture system to production.

## Overview

Deployment is simpler with YouTube because:
- No video token generation needed
- YouTube handles video delivery
- Only visitor tracking backend required
- Minimal infrastructure needed

---

## Prerequisites Checklist

Before deploying, verify:

- [ ] YouTube video uploaded and set to Unlisted
- [ ] YouTube video ID copied
- [ ] Cloudflare account with billing configured
- [ ] Domain registered and pointing to Cloudflare
- [ ] Workers enabled in Cloudflare
- [ ] D1 database enabled in Cloudflare
- [ ] All configuration values obtained
- [ ] Tested locally and all tests pass

---

## Phase 1: Cloudflare Configuration

### 1.1 Create D1 Database (Production)

```bash
cd worker

# Create production database
wrangler d1 create lecture_db_production

# Output:
# 🎉 Created database 'lecture_db_production' with ID: abc123...
# Copy the DATABASE_ID
```

### 1.2 Configure Allowed Origins

In `worker/wrangler.toml`, update the production routes:

```toml
[env.production]
routes = [
    { pattern = "yourdomain.com/api/*", zone_name = "yourdomain.com" },
    { pattern = "www.yourdomain.com/api/*", zone_name = "yourdomain.com" }
]

[[d1_databases]]
binding = "DB"
database_name = "lecture_db_production"
database_id = "YOUR_PRODUCTION_DATABASE_ID"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "YOUR_KV_NAMESPACE_ID"
```

Replace:
- `yourdomain.com` with your actual domain
- `YOUR_PRODUCTION_DATABASE_ID` with your D1 ID
- `YOUR_KV_NAMESPACE_ID` with your KV namespace ID

### 1.3 Apply Database Schema

```bash
# Apply schema to production database
wrangler d1 execute lecture_db_production \
  --file=../database/schema.sql \
  --remote

# Verify tables were created
wrangler d1 query lecture_db_production \
  "SELECT name FROM sqlite_master WHERE type='table';" \
  --remote

# Output should show:
# lecture_visits
```

---

## Phase 2: Worker Deployment

### 2.1 Generate Admin Secret

```bash
# Generate a secure random string
openssl rand -hex 32

# Example output:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8

# Save this for next step
```

### 2.2 Set Production Secrets

```bash
# Each command prompts for the value

wrangler secret put ALLOWED_ORIGIN --env production
# Paste: https://yourdomain.com
# Or if using www: https://www.yourdomain.com

wrangler secret put ADMIN_SECRET --env production
# Paste the secure string from Step 2.1

wrangler secret put DATABASE_ID --env production
# Paste the database ID from Step 1.1
```

### 2.3 Deploy Worker

```bash
# Deploy to production
wrangler deploy --env production

# Output shows:
# ✓ Uploaded secure-lecture-worker successfully
# https://secure-lecture-worker.YOUR_ACCOUNT.workers.dev
```

Save this worker URL for DNS configuration.

---

## Phase 3: Frontend Configuration

### 3.1 Update Configuration

Edit `frontend/index.html` with production values:

```javascript
const LECTURE_CONFIG = {
    id: "lecture-01",
    title: "YOUR ACTUAL LECTURE TITLE",
    professor: "ACTUAL PROFESSOR NAME",
    date: "2026-09-05",
    duration: "48:32",
    youtubeVideoId: "YOUR_ACTUAL_YOUTUBE_VIDEO_ID"
};
```

### 3.2 Update Styling (Optional)

Edit `frontend/style.css` if you want custom:
- Colors
- Typography
- Spacing

---

## Phase 4: Frontend Deployment

### Option A: Cloudflare Pages (Recommended)

```bash
cd frontend

# Deploy to Cloudflare Pages
wrangler pages publish . --project-name=lecture

# Output shows deployment URL:
# https://lecture.pages.dev
```

Then configure your domain to point to this.

### Option B: GitHub Pages

```bash
cd frontend

# Initialize git if needed
git init
git add .
git commit -m "Deploy lecture website"

# Deploy to GitHub Pages
npm run deploy:pages

# Follow GitHub Pages setup instructions
```

### Option C: Netlify

```bash
npm install -g netlify-cli

cd frontend

# Deploy to Netlify
netlify deploy --prod --dir=.

# Follow prompts to authorize and deploy
```

### Option D: Other Static Hosts

Upload the `frontend/` directory to your hosting provider:
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Cloud Storage
- Any static host

---

## Phase 5: DNS Configuration

### 5.1 Main Domain

**If using Cloudflare Pages:**
```dns
yourdomain.com CNAME lecture.pages.dev (or your pages URL)
www.yourdomain.com CNAME lecture.pages.dev
```

**If using GitHub Pages:**
```dns
yourdomain.com CNAME your-username.github.io
www.yourdomain.com CNAME your-username.github.io
```

**If using Netlify:**
```dns
yourdomain.com CNAME your-site.netlify.app
www.yourdomain.com CNAME your-site.netlify.app
```

**If using other host:**
Follow their DNS setup instructions.

### 5.2 API Subdomain

Point API subdomain to your Cloudflare Worker:

```dns
api.yourdomain.com CNAME secure-lecture-worker.YOUR_ACCOUNT.workers.dev
```

### 5.3 Verify DNS

```bash
# Test main domain
nslookup yourdomain.com
# Should resolve to your host

# Test API subdomain
nslookup api.yourdomain.com
# Should resolve to worker

# Wait for propagation (up to 48 hours, usually faster)
```

---

## Phase 6: HTTPS & Security

### 6.1 Verify HTTPS

```bash
# Test HTTPS connection
curl -I https://yourdomain.com

# Should return 200 (not error)
# Should NOT redirect from https to http
```

### 6.2 Check SSL Certificate

```bash
# Verify SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Should show valid certificate
# Look for: "Verify return code: 0 (ok)"
```

### 6.3 Test Security Headers

```bash
# Verify security headers
curl -I https://yourdomain.com/api/admin/visitor-count

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
```

---

## Phase 7: Testing & Verification

### 7.1 Functional Test

1. Open https://yourdomain.com in browser
2. Verify:
   - [ ] Page loads (not error)
   - [ ] Lecture info displays
   - [ ] YouTube player visible
   - [ ] Play button works
   - [ ] Console clean (F12 → Console)
   - [ ] No network errors (F12 → Network)

### 7.2 Security Test

```bash
# Test token endpoint
curl -X POST https://yourdomain.com/api/visit \
  -H "Origin: https://yourdomain.com" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Should return: {"success":true}

# Test with wrong origin (should fail)
curl -X POST https://yourdomain.com/api/visit \
  -H "Origin: https://attacker.com" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"lecture-01","sessionId":"550e8400-e29b-41d4-a716-446655440000"}'

# Should return 403 Forbidden
```

### 7.3 DevTools Security Check

1. Open https://yourdomain.com
2. Press F12 (DevTools)
3. Go to Sources tab
4. Search for: `SECRET`, `TOKEN`, `KEY`, `PASSWORD`
5. Should find NOTHING sensitive
6. YouTube ID visible (OK - not secret)

### 7.4 Visitor Count Test

```bash
# Get visitor count
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://yourdomain.com/api/admin/visitor-count

# Should return:
# {
#   "lectureId": "lecture-01",
#   "visitorCount": N
# }
```

---

## Phase 8: Performance Optimization

### 8.1 Enable Caching

In Cloudflare Dashboard:

1. Go to Caching → Cache Level
2. Set to "Cache Everything"
3. Set Browser Cache TTL to 30 minutes

### 8.2 Enable Compression

In Cloudflare Dashboard:

1. Go to Speed → Optimization
2. Enable "Brotli"
3. Verify "Gzip" enabled

### 8.3 Optimize Images

Ensure `frontend/` has minimal images (already is - HTML/CSS only).

---

## Phase 9: Monitoring Setup

### 9.1 Enable Worker Logging

```bash
# View live worker logs
wrangler tail --env production

# Shows:
# - All API requests
# - Errors
# - Performance metrics
```

### 9.2 Monitor Visitor Count

```bash
# Create a monitoring script
cat > monitor_visitors.sh << 'EOF'
#!/bin/bash
ADMIN_SECRET="YOUR_ADMIN_SECRET"
API_URL="https://yourdomain.com"

echo "$(date): Checking visitor count..."
curl -s -H "Authorization: Bearer $ADMIN_SECRET" \
  "$API_URL/api/admin/visitor-count" | jq .visitorCount
EOF

chmod +x monitor_visitors.sh

# Run hourly via cron:
# 0 * * * * /path/to/monitor_visitors.sh >> /var/log/visitors.log
```

### 9.3 Set Up Error Tracking (Optional)

Consider integrating:
- Sentry (JavaScript errors)
- LogRocket (User sessions)
- Datadog (Infrastructure)

---

## Phase 10: Production Checklist

Before declaring complete, verify all:

### Functionality
- [ ] Website loads via HTTPS
- [ ] YouTube video player visible
- [ ] Video plays without errors
- [ ] Audio works
- [ ] Controls responsive
- [ ] Mobile responsive
- [ ] No console errors

### Security
- [ ] No secrets in frontend
- [ ] CORS restricts to your domain
- [ ] Rate limiting works
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] Admin endpoint protected

### Performance
- [ ] Page load < 3 seconds
- [ ] Video starts < 5 seconds
- [ ] No lag or jank
- [ ] Responsive on all devices

### Configuration
- [ ] Domain configured
- [ ] DNS propagated
- [ ] Worker deployed
- [ ] Frontend deployed
- [ ] Database created
- [ ] All secrets set

### Documentation
- [ ] README.md accessible
- [ ] SECURITY.md reviewed
- [ ] API.md available
- [ ] Admin procedures documented
- [ ] Backup procedures set

---

## Post-Deployment

### 11.1 Monitor First 24 Hours

- Check worker logs: `wrangler tail`
- Monitor visitor count growth
- Test from different devices/networks
- Monitor error rates

### 11.2 Share with Users

Once verified working:

1. Share YouTube video link: `https://yourdomain.com`
2. Share in syllabus or course materials
3. Use as needed
4. Monitor visitor analytics

### 11.3 Weekly Maintenance

```bash
# Check for errors
wrangler tail --env production | grep ERROR

# Review visitor count
curl -H "Authorization: Bearer $ADMIN_SECRET" \
  https://yourdomain.com/api/admin/visitor-count
```

### 11.4 Monthly Tasks

- Review YouTube video analytics
- Check worker logs for patterns
- Verify backups working
- Update documentation if needed

---

## Rollback Procedure

If something breaks:

### Option 1: Revert Worker

```bash
# Check deployment history
wrangler deployments list --env production

# Rollback to previous version
wrangler rollback --env production
```

### Option 2: Revert Frontend

Depends on hosting:
- **Cloudflare Pages:** Use deployment history in dashboard
- **GitHub Pages:** Revert commit and redeploy
- **Netlify:** Use deployment history in dashboard
- **Other:** Re-upload previous version

### Option 3: Emergency Maintenance

Deploy minimal holding page explaining maintenance.

---

## Troubleshooting Deployments

### Worker won't deploy

```bash
# Check for syntax errors
npm run lint

# Check secrets are set
wrangler secret list --env production

# Try with verbose output
wrangler deploy --env production --verbose
```

### Frontend not accessible

```bash
# Check DNS resolution
nslookup yourdomain.com

# Verify hosting provider is serving
curl -I https://yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

### CORS errors

```bash
# Verify ALLOWED_ORIGIN matches exactly
wrangler secret list --env production

# Check worker logs
wrangler tail --env production | grep -i cors

# Test directly
curl -v -H "Origin: https://yourdomain.com" \
  https://yourdomain.com/api/visit
```

### Database connection issues

```bash
# Verify database exists
wrangler d1 list

# Check schema
wrangler d1 query lecture_db_production \
  "SELECT * FROM sqlite_master WHERE type='table';" \
  --remote

# Test query
wrangler d1 query lecture_db_production \
  "SELECT COUNT(*) FROM lecture_visits;" \
  --remote
```

---

## Support Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [YouTube Help Center](https://support.google.com/youtube/)

---

## Success Criteria

You're successfully deployed when:

✓ Website loads at https://yourdomain.com
✓ YouTube video player visible
✓ Video plays without errors
✓ Visitor count increments
✓ Admin can access visitor stats
✓ All HTTPS with valid certificate
✓ No console errors
✓ Works on mobile and desktop
✓ CORS properly restricted
✓ Security headers present

---

**Deployment complete! Your YouTube-based lecture website is live.**

Next: See README.md for ongoing maintenance and support.
