# COMPLETE PROJECT PROMPT
## Secure Single-Lecture Video Website — No Login, Cloudflare Stream, Visitor Count Only

Build a complete, production-ready website for hosting **exactly ONE lecture video**.

The website must be simple, clean, responsive, lightweight, and security-conscious.

The primary objective is:

> Allow visitors to watch one lecture without requiring login, while keeping the permanent/private video URL and all server-side secrets out of the frontend and using short-lived authorized playback.

The second objective is:

> Count anonymous visitors to the lecture page.

Do NOT implement time-spent tracking or watch-time analytics.

---

# 1. VERY IMPORTANT — EXACT SCOPE

This website contains **ONE lecture only**.

Do NOT build:

- Course management
- Multiple lectures
- Lecture listing
- Lecture categories
- Search
- User accounts
- Login
- Signup
- Student dashboard
- Comments
- Likes
- Social sharing
- Payment
- Subscription
- Watch history
- Time-spent tracking
- Watch-time analytics

The website should essentially be a single lecture page.

---

# 2. FINAL USER EXPERIENCE

The visitor opens:

```text
https://YOURDOMAIN.com/
```

They see:

```text
────────────────────────────────────

             LECTURE

        LECTURE TITLE

Professor: Dr. XXXXX
Date: 05 September 2026
Duration: 48:32


┌──────────────────────────────────┐
│                                  │
│                                  │
│          VIDEO PLAYER            │
│                                  │
│                                  │
└──────────────────────────────────┘


     ↶ 10 sec    ▶ / ❚❚    20 sec ↷

             🔊 Volume / Mute

────────────────────────────────────
```

That's it.

Keep the page visually clean and professional.

---

# 3. VIDEO HOSTING

Use:

**Cloudflare Stream**

Do NOT use:

- YouTube
- Google Drive
- Dropbox
- GitHub
- Direct MP4 hosting
- Public object storage
- Permanent public video URLs

The lecture video must be uploaded to Cloudflare Stream.

Configure the video so that public/unsigned playback is not allowed.

Use Cloudflare's current supported mechanism for:

**Signed URLs / signed tokens / protected playback.**

Before implementing this, check the latest official Cloudflare Stream documentation because the API and token mechanism may change over time.

Do NOT rely on an outdated tutorial.

---

# 4. VIDEO SECURITY OBJECTIVE

The goal is NOT to claim that a browser can never reveal a network request.

A browser must receive media in order to play it.

Instead, the security objective is:

### The frontend must NOT contain:

- Cloudflare API token
- Cloudflare API secret
- Stream signing key
- Private keys
- Database credentials
- Worker secrets
- Permanent signed video URL
- Direct MP4 URL
- Public downloadable video file

### The system should provide:

- Short-lived playback authorization
- Server-side token generation
- Cloudflare Stream protected playback
- Allowed-origin restrictions
- HTTPS
- Secure server-side secrets
- Rate limiting
- Restrictive security headers

Do NOT claim:

> "The video is impossible to extract."

Instead state:

> "The system prevents permanent public video URLs and keeps signing credentials server-side, while recognizing that browser-level media requests can still be inspected by a sufficiently sophisticated user."

---

# 5. NO LOGIN

There must be:

**NO login.**

Visitors do not need:

- Username
- Password
- Email
- OTP
- Account
- Registration

Anyone who can access the webpage may request playback authorization.

The security comes from the protected streaming architecture rather than a student account system.

---

# 6. ARCHITECTURE

Use this architecture:

```text
                         VISITOR
                            │
                            ▼
                    YOUR WEBSITE
                    Static Frontend
                            │
                            │ request playback
                            ▼
                  CLOUDFLARE WORKER
                            │
                   Server-side secret
                            │
                            ▼
                Short-lived authorization
                            │
                            ▼
                  CLOUDFLARE STREAM
                            │
                            ▼
                       VIDEO PLAYER
```

For visitor counting:

```text
Visitor
   │
   ▼
Frontend
   │
   │ anonymous visit event
   ▼
Cloudflare Worker
   │
   ▼
Cloudflare D1
   │
   ▼
Anonymous visitor record
```

---

# 7. RECOMMENDED TECHNOLOGY

Use:

### Frontend

- HTML
- CSS
- Vanilla JavaScript

Do not use a heavy frontend framework unless there is a strong technical reason.

### Backend

- Cloudflare Workers

### Database

- Cloudflare D1

### Video

- Cloudflare Stream

### Hosting

The frontend may be hosted on a static hosting service such as GitHub Pages, Cloudflare Pages, or another static host.

Make the implementation configurable.

---

# 8. SINGLE LECTURE CONFIGURATION

There must be exactly ONE lecture.

Use a single configuration object.

Example:

```javascript
const LECTURE = {
    id: "lecture-01",
    title: "YOUR LECTURE TITLE",
    professor: "PROFESSOR NAME",
    date: "2026-09-05",
    duration: "48:32",
    videoId: "YOUR_CLOUDFLARE_STREAM_VIDEO_ID"
};
```

Do NOT create:

```javascript
const lectures = [...]
```

There should be no lecture array.

There should be no lecture database.

There should be no lecture selection UI.

There should be only:

```text
lecture-01
```

---

# 9. VIDEO ID

The Cloudflare Stream video ID may be present in frontend code if required by the player architecture.

However, understand that the video ID is not a secret.

The actual security must come from:

- Signed playback
- Short-lived authorization
- Allowed origins
- Server-side secrets

Do NOT attempt to "encrypt" the video ID in JavaScript and pretend that this provides security.

Do NOT use Base64 as fake encryption.

---

# 10. BACKEND TOKEN ENDPOINT

Create an endpoint such as:

```text
POST /api/video-token
```

or another architecture recommended by current Cloudflare documentation.

The frontend requests playback authorization from this endpoint.

The Worker should:

1. Receive the request.
2. Validate the request.
3. Validate the Origin.
4. Confirm that the requested lecture is exactly `lecture-01`.
5. Use server-side secrets.
6. Generate the appropriate short-lived Cloudflare Stream authorization.
7. Return only the information required by the player.
8. Never expose secrets.

Do not allow users to request arbitrary video IDs.

For example, reject:

```text
videoId=some-other-video
```

Only the configured single lecture may be authorized.

---

# 11. SERVER-SIDE SECRETS

Use Cloudflare Worker secrets/environment variables.

Example:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_STREAM_SIGNING_KEY
VIDEO_ID
ALLOWED_ORIGIN
```

Use the exact variables required by the current Cloudflare implementation.

The signing key must NEVER appear in:

- HTML
- CSS
- JavaScript
- GitHub repository
- README
- browser localStorage
- browser sessionStorage
- query strings
- public configuration files

Provide an example configuration file containing only placeholders:

```text
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
CLOUDFLARE_STREAM_SIGNING_KEY=YOUR_SIGNING_KEY
VIDEO_ID=YOUR_VIDEO_ID
ALLOWED_ORIGIN=https://YOURDOMAIN.com
```

Never put real credentials in the example file.

---

# 12. TOKEN EXPIRATION

Playback authorization must be short-lived.

Use a reasonable expiration such as approximately:

**30 minutes**

unless Cloudflare's current recommended implementation requires another value.

The important requirement is:

> Do not create a permanent signed playback URL.

If the user continues watching and authorization expires, implement the appropriate refresh mechanism supported by Cloudflare.

Do not break playback unnecessarily.

---

# 13. PLAYER

Use Cloudflare Stream's supported player/integration.

Do not use YouTube.

Do not create a complicated custom streaming engine.

The player should provide:

- Play
- Pause
- Progress bar
- Volume
- Mute
- 10-second backward
- 20-second forward

If Cloudflare's native player does not directly provide the exact 10-second backward and 20-second forward buttons, use its officially supported player API/events to implement those controls.

Do NOT manipulate undocumented internal player behavior.

---

# 14. PLAYER CONTROLS

The desired controls are:

```text
↶ 10 seconds
Play / Pause
20 seconds ↷
Volume
Mute
Progress
```

Do not include unnecessary custom controls.

Do not add:

- Download button
- Share button
- Social buttons
- Playlist
- Related videos
- Comments

Where the video provider/player officially supports disabling unnecessary sharing/download UI, configure it appropriately.

Do not rely on fake JavaScript security.

---

# 15. DOWNLOAD PROTECTION

Do not provide any download button.

Do not host a downloadable MP4 on the website.

Do not put a direct MP4 URL in the frontend.

Use Cloudflare Stream's protected streaming mechanism.

However, clearly document:

> A browser cannot be guaranteed to prevent a determined user from capturing or inspecting media requests.

Do not falsely claim that JavaScript can prevent downloads.

---

# 16. SHARE PROTECTION

There should be no visible share button on the lecture page.

Do not display:

- Stream URL
- MP4 URL
- YouTube URL
- Permanent playback URL

If the player supports disabling share UI through an official setting, use it.

Do not invent undocumented parameters.

---

# 17. DEVTOOLS / INSPECT

Do NOT implement fake security such as:

```javascript
disableF12()
```

or:

```javascript
detectDevTools()
```

or:

```javascript
document.onkeydown = ...
```

Do not:

- Disable F12
- Disable Ctrl+Shift+I
- Disable Ctrl+U
- Create infinite alerts
- Detect developer tools
- Lock the keyboard
- Crash the browser
- Obfuscate JavaScript as fake encryption

These are not real security.

The real protection must come from the backend and video delivery architecture.

---

# 18. FRONTEND SECURITY REQUIREMENT

After implementation, inspect the complete frontend source.

The following must NOT appear:

```text
Cloudflare API token
Cloudflare API secret
Signing key
Database password
Worker secret
Private key
Permanent signed URL
Direct MP4 URL
```

The frontend may contain:

```text
lecture-01
YOUR_STREAM_VIDEO_ID
Lecture title
Professor name
Date
Duration
```

That is acceptable.

---

# 19. VISITOR COUNT — ONLY ANALYTICS

I only need:

**Visitor count.**

Do NOT track:

- Time spent
- Watch time
- Playback duration
- Video position
- Percentage watched
- Completion
- Play history
- Pause history
- Heartbeats
- Page duration

Remove all of these features completely.

---

# 20. ANONYMOUS VISITOR COUNT

When someone visits the lecture page:

1. Generate an anonymous random session identifier.
2. Send a visit event to the backend.
3. Backend checks whether this session has already been counted.
4. If not counted, record it.
5. Do not repeatedly increment the same session.

Use a random identifier rather than fingerprinting.

For example:

```javascript
crypto.randomUUID()
```

Store it in an appropriate browser storage mechanism.

Choose `sessionStorage` or `localStorage` based on the intended definition of a visitor and explain the choice.

Do NOT fingerprint users.

---

# 21. VISITOR DATABASE

Use Cloudflare D1.

Keep the schema extremely simple.

Example:

```sql
CREATE TABLE lecture_visits (
    session_id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL,
    first_seen INTEGER NOT NULL
);
```

There should be only one lecture:

```text
lecture-01
```

Do not create:

- courses table
- lectures table
- students table
- users table
- watch_history table
- playback_events table
- time_tracking table

---

# 22. VISIT API

Create:

```text
POST /api/visit
```

The frontend sends something similar to:

```json
{
    "lectureId": "lecture-01",
    "sessionId": "random-session-id"
}
```

The backend should:

1. Validate JSON.
2. Validate lecture ID.
3. Validate session ID format.
4. Validate Origin.
5. Rate-limit requests.
6. Insert the visitor if it does not already exist.
7. Return a minimal response.

Example:

```json
{
    "success": true
}
```

Do not return analytics information to the visitor.

---

# 23. VISITOR COUNT ENDPOINT

If an admin endpoint is implemented, for example:

```text
GET /api/admin/visitor-count
```

it MUST be protected.

Do not expose the count-management endpoint publicly without authorization if it contains administrative information.

The public visitor must not be able to access:

- Individual session IDs
- Visitor records
- Database contents
- Visitor timestamps
- Other analytics

An admin should ultimately be able to see:

```text
Lecture 01
Total Visitors: 137
```

---

# 24. PRIVACY

Collect only what is required.

Do NOT implement:

- IP fingerprinting
- Canvas fingerprinting
- Audio fingerprinting
- Device fingerprinting
- Browser fingerprinting
- GPS/location tracking
- Advertising trackers
- Unnecessary cookies
- Personal profiles

No login means there is no reason to collect:

- Name
- Email
- Phone number
- Password

The visitor identifier should be random and anonymous.

---

# 25. CORS

Configure CORS carefully.

Do NOT use:

```text
Access-Control-Allow-Origin: *
```

for protected backend endpoints.

Allow only:

```text
https://YOURDOMAIN.com
```

and optionally the `www` version if required.

However:

> Do not treat CORS as authentication.

CORS is an additional browser security control, not a replacement for server-side authorization.

---

# 26. ORIGIN RESTRICTION

Configure Cloudflare Stream allowed origins if supported by the current Stream configuration.

Allow only the actual website domain.

Example:

```text
https://YOURDOMAIN.com
```

Optionally:

```text
https://www.YOURDOMAIN.com
```

if both are actually used.

Do not allow:

```text
*
```

unless absolutely required.

---

# 27. RATE LIMITING

Protect:

```text
/api/video-token
/api/visit
```

against abuse.

Use Cloudflare's current recommended rate-limiting mechanism.

Do not make the limit so strict that normal visitors cannot watch the lecture.

The goal is to prevent:

- Token endpoint flooding
- Automated requests
- Visitor-count manipulation
- Obvious abuse

---

# 28. SECURITY HEADERS

Configure appropriate security headers.

At minimum evaluate:

```text
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Create a restrictive CSP.

Do not use:

```text
script-src *
connect-src *
frame-src *
```

unless absolutely required.

Only permit resources actually needed by:

- Website
- Cloudflare Stream
- Player
- Backend API

---

# 29. HTTPS

The entire website must use HTTPS.

Never transmit:

- tokens
- analytics requests
- video authorization

over plain HTTP.

Redirect HTTP to HTTPS where appropriate.

---

# 30. TOKEN/API ERROR HANDLING

If authorization fails, show:

> Unable to load the lecture video. Please refresh the page.

Do not show:

- API credentials
- Stack traces
- Cloudflare internal errors
- Signing information
- Database errors
- Worker internals

Log useful errors server-side.

---

# 31. VIDEO ERROR HANDLING

If the video cannot load:

Show a clean message such as:

> The lecture video could not be loaded. Please try again.

Provide a retry option.

Do not expose the underlying private URL.

---

# 32. FRONTEND DESIGN

Create a minimal academic interface.

Use:

- Clean typography
- Good spacing
- Responsive layout
- Light, professional design
- Accessible contrast
- Minimal JavaScript
- No unnecessary animations

The lecture should be the focus.

Suggested structure:

```html
<main>
    <header>
        <p>LECTURE</p>
        <h1>Lecture Title</h1>

        <div class="lecture-meta">
            <span>Professor: Dr. XXXXX</span>
            <span>Date: 05 September 2026</span>
            <span>Duration: 48:32</span>
        </div>
    </header>

    <section class="video-section">
        <!-- Secure Cloudflare Stream player -->
    </section>
</main>
```

---

# 33. RESPONSIVE DESIGN

The page must work on:

- Desktop
- Laptop
- Tablet
- Android
- iPhone

The video must maintain an appropriate aspect ratio.

Controls must be easy to use on touchscreens.

---

# 34. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard-accessible controls
- ARIA labels where required
- Accessible buttons
- Proper focus states
- Good contrast
- Responsive text

Do not sacrifice accessibility for unnecessary anti-user restrictions.

---

# 35. PROJECT STRUCTURE

Create a clean project structure such as:

```text
secure-single-lecture/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── worker/
│   ├── src/
│   │   └── index.js
│   ├── wrangler.toml
│   └── .dev.vars.example
│
├── database/
│   └── schema.sql
│
├── .gitignore
│
├── README.md
│
└── SECURITY.md
```

You may change this structure if Cloudflare's current recommended architecture is better.

Keep the project simple.

---

# 36. GIT SECURITY

Create a `.gitignore`.

Ensure secrets cannot accidentally be committed.

Include appropriate entries for:

```text
.env
.dev.vars
.env.*
node_modules/
.wrangler/
```

Do not commit:

- API keys
- Signing keys
- Cloudflare credentials
- Database credentials

---

# 37. ENVIRONMENT CONFIGURATION

Create an example file such as:

```text
.dev.vars.example
```

with:

```text
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
CLOUDFLARE_STREAM_SIGNING_KEY=YOUR_SIGNING_KEY
VIDEO_ID=YOUR_VIDEO_ID
ALLOWED_ORIGIN=https://YOURDOMAIN.com
```

Use the exact names required by the implementation.

Never include real credentials.

Explain exactly how to configure secrets using Cloudflare's current recommended secret-management system.

---

# 38. CLOUDFLARE STREAM SETUP DOCUMENTATION

In the README explain step-by-step:

1. Create Cloudflare account.
2. Open Stream.
3. Upload the single lecture.
4. Find the Stream video ID.
5. Configure signed playback.
6. Configure allowed origins.
7. Obtain/configure the required signing credentials.
8. Add them as Worker secrets.
9. Test unsigned playback.
10. Test signed playback.

Use the latest official Cloudflare documentation.

---

# 39. CLOUDFLARE WORKER SETUP

Explain:

1. Install Node.js if required.
2. Install Wrangler.
3. Authenticate with Cloudflare.
4. Create Worker.
5. Configure Worker.
6. Add secrets.
7. Configure routes.
8. Create D1 database.
9. Apply schema.
10. Bind D1 to Worker.
11. Run locally.
12. Deploy.
13. Test production.

Do not assume the user already knows Cloudflare Workers.

---

# 40. D1 SETUP

Explain:

1. Create D1 database.
2. Apply `schema.sql`.
3. Configure the Worker binding.
4. Run migrations/schema.
5. Verify the table.
6. Deploy.

Keep D1 only for anonymous visitor counting.

---

# 41. DOMAIN SETUP

Make the domain configurable.

Do not hard-code a fake domain.

Use:

```text
YOURDOMAIN.com
```

in documentation.

Explain how to configure:

```text
https://YOURDOMAIN.com
```

as the allowed origin.

If using GitHub Pages or another static host, explain how the Worker API can be connected to the frontend.

---

# 42. PLAYER TOKEN FLOW

Implement the actual token flow according to the current Cloudflare Stream documentation.

Conceptually:

```text
1. Visitor opens webpage.

2. Frontend knows:
   lecture-01
   video ID

3. Frontend requests:
   /api/video-token

4. Worker validates request.

5. Worker uses server-side signing credentials.

6. Worker generates short-lived authorization.

7. Worker returns only required playback authorization.

8. Player starts Cloudflare Stream playback.

9. No permanent MP4 URL is stored in frontend.
```

Follow Cloudflare's current official API implementation.

---

# 43. DO NOT INVENT CRYPTOGRAPHY

Do NOT create your own encryption.

Do NOT:

- Encrypt MP4 with custom JavaScript
- Decrypt video in browser manually
- Create custom AES implementations unless specifically required by an officially supported streaming protocol
- Encode URLs with Base64
- XOR URLs
- Obfuscate URLs
- Split URLs into strings
- Hide URLs inside images
- Hide URLs in CSS

Use Cloudflare's supported security mechanisms.

---

# 44. NO PUBLIC MP4

The video must not be stored as:

```text
https://YOURDOMAIN.com/video.mp4
```

or:

```text
https://cdn.YOURDOMAIN.com/lecture.mp4
```

where anyone can download it directly.

Cloudflare Stream should be responsible for video delivery.

---

# 45. NO PERMANENT TOKEN

Do not generate:

```text
token_that_never_expires
```

Every playback authorization must have an expiration.

Do not store permanent authorization tokens in:

- localStorage
- sessionStorage
- cookies
- HTML
- JavaScript source

unless specifically required by the current Cloudflare implementation and appropriately secured.

---

# 46. COOKIE POLICY

Avoid cookies unless actually required.

If cookies are used by the implementation, use appropriate:

```text
Secure
HttpOnly
SameSite
```

attributes where applicable.

Do not use cookies to store Cloudflare signing secrets.

---

# 47. VISITOR COUNT DETAILS

The visitor count should be an approximate anonymous count.

For example:

```text
Visitor A opens page
→ session ID generated
→ database record created
→ count = 1

Visitor A refreshes
→ same session ID
→ count remains 1

Visitor B opens page
→ new session ID
→ count = 2
```

Explain in README that browser/session-based anonymous counting is not equivalent to guaranteed real-world unique-person identification.

Do not attempt to identify individuals.

---

# 48. ADMIN COUNT

If an admin count is implemented, keep it simple.

Example:

```text
GET /api/admin/visitor-count
```

It should return:

```json
{
    "lectureId": "lecture-01",
    "visitorCount": 137
}
```

Only authorized administrator requests may access this.

Do not create an admin dashboard unless necessary.

A simple protected endpoint is sufficient.

---

# 49. DO NOT DISPLAY VISITOR COUNT PUBLICLY

By default, do not show:

```text
137 people have watched this lecture
```

on the public lecture page.

Keep visitor statistics private.

---

# 50. TESTING

Before declaring the project complete, test everything.

## Functional tests

Verify:

- Website loads.
- Lecture information appears.
- Video player loads.
- Play works.
- Pause works.
- Volume works.
- Mute works.
- Progress bar works.
- 10-second rewind works.
- 20-second forward works.
- Mobile works.
- Desktop works.

---

# 51. SECURITY TESTING

Open:

- View Source
- Elements
- Sources
- Network
- Application/Storage

Verify:

### Must NOT find:

- Cloudflare API token
- Cloudflare signing key
- Database credentials
- Worker secret
- Permanent MP4
- Permanent downloadable video URL

### Verify:

- Unsigned video access fails.
- Invalid token fails.
- Expired token fails.
- Unauthorized origin is rejected where supported.
- Token endpoint is rate-limited.
- Analytics endpoint does not expose visitor data.
- Admin endpoint is protected.

---

# 52. DEVTOOLS TEST

Use DevTools and document what is visible.

The test should specifically answer:

```text
Can the user see the signing secret?
NO.

Can the user see the Cloudflare API credentials?
NO.

Can the user see a permanent MP4 URL?
NO.

Can the user see the public frontend configuration?
YES.

Can a technically skilled user inspect network requests made during playback?
POTENTIALLY YES.
```

Document this honestly.

Do NOT claim otherwise.

---

# 53. SECURITY DOCUMENT

Create:

```text
SECURITY.md
```

Include:

## Protected

- API credentials
- Signing credentials
- Database credentials
- Permanent video URLs
- Permanent playback authorization

## Security mechanisms

- HTTPS
- Signed playback
- Short-lived authorization
- Allowed origins
- Server-side secrets
- Rate limiting
- Security headers
- No public MP4

## Limitations

Explain that no browser-based video system can guarantee prevention of:

- Screen recording
- External-camera recording
- A sufficiently skilled user inspecting browser/network activity
- Copying temporary browser requests

The project should provide strong practical protection without making false claims.

---

# 54. README

Create a detailed README containing:

1. Project overview
2. Architecture diagram
3. Prerequisites
4. Cloudflare account setup
5. Cloudflare Stream setup
6. Uploading the single video
7. Signed playback configuration
8. Allowed-origin configuration
9. Worker setup
10. D1 setup
11. Secret configuration
12. Frontend configuration
13. Local development
14. Production deployment
15. Domain configuration
16. Visitor counting
17. Security model
18. Testing
19. Troubleshooting
20. Production checklist

Write it for someone with basic web-development knowledge.

---

# 55. CURRENT DOCUMENTATION REQUIREMENT

Before implementing Cloudflare functionality, consult the CURRENT official Cloudflare documentation.

Verify the current behavior/API for:

- Cloudflare Stream
- Signed URLs
- Signed tokens
- Stream player
- Allowed origins
- Cloudflare Workers
- D1
- Worker secrets
- Rate limiting

Do not rely on outdated Stack Overflow answers or old tutorials when official documentation is available.

If the current Cloudflare architecture differs from the assumptions in this prompt, adapt the implementation while preserving the requirements.

---

# 56. CODE QUALITY

Write clean production-quality code.

Requirements:

- Modular where useful
- Clear variable names
- Comments for security-sensitive code
- Proper error handling
- No unnecessary dependencies
- No dead code
- No unused analytics code
- No fake security code
- No hard-coded secrets

Keep the implementation understandable.

---

# 57. FINAL PROJECT MUST HAVE

At completion, the project must contain:

### Frontend

- `index.html`
- `style.css`
- `app.js`

### Backend

- Cloudflare Worker
- Video authorization endpoint
- Visitor endpoint
- Optional protected admin count endpoint

### Database

- D1 schema
- One visitor table

### Configuration

- Worker configuration
- Example environment/secrets file
- `.gitignore`

### Documentation

- `README.md`
- `SECURITY.md`

---

# 58. FINAL ACCEPTANCE CRITERIA

Do not consider the project finished unless all of the following are true:

### Lecture

- Exactly ONE lecture.
- No lecture listing.
- No login.
- No signup.

### Video

- Cloudflare Stream.
- No public MP4.
- Signed/authorized playback.
- Short-lived authorization.
- No permanent playback authorization.

### Frontend

- Simple.
- Responsive.
- Official/supported Cloudflare player.
- Play/Pause.
- 10-second backward.
- 20-second forward.
- Volume.
- Mute.
- No download button.
- No share button.

### Security

- No secrets in frontend.
- No signing key in frontend.
- No Cloudflare API token in frontend.
- No database credentials in frontend.
- HTTPS.
- Allowed-origin restrictions.
- CORS restrictions.
- Rate limiting.
- Security headers.
- No fake DevTools blocking.

### Analytics

- Visitor count ONLY.
- Anonymous session ID.
- No watch-time tracking.
- No page-time tracking.
- No playback history.
- No fingerprinting.
- No unnecessary personal data.

---

# 59. FINAL SECURITY AUDIT

After writing the entire project, perform a final audit.

Search every frontend file for:

```text
secret
token
api_key
apiKey
password
private
signing
CLOUDFLARE
mp4
.m3u8
```

Determine whether anything sensitive is accidentally exposed.

Also inspect the final network flow.

Then provide a short report:

```text
SECURITY AUDIT

Frontend secrets exposed: NO
Permanent MP4 exposed: NO
Permanent signed URL exposed: NO
Cloudflare signing key exposed: NO
Database credentials exposed: NO
Unsigned playback allowed: NO
Short-lived authorization: YES
Allowed origin configured: YES
Visitor count implemented: YES
Watch-time tracking implemented: NO
Login required: NO
Multiple lectures: NO
```

If any item cannot honestly be marked YES/NO, explain why.

---

# 60. IMPORTANT FINAL INSTRUCTION

Do not merely give me a tutorial.

**WRITE THE COMPLETE WORKING PROJECT.**

Provide all source files and configuration files.

Do not leave core functionality as pseudocode.

Use placeholders only where I must supply my own values:

```text
YOURDOMAIN.com
YOUR_VIDEO_ID
YOUR_CLOUDFLARE_ACCOUNT_ID
YOUR_SIGNING_SECRET
```

Do not fabricate Cloudflare credentials or pretend that a placeholder is a real credential.

The final result should be deployable after I insert my own Cloudflare configuration.

Again:

**ONE LECTURE ONLY.**
**NO LOGIN.**
**CLOUDFLARE STREAM.**
**SECURE SHORT-LIVED PLAYBACK AUTHORIZATION.**
**NO PERMANENT PUBLIC VIDEO URL.**
**NO DOWNLOAD/SHARE UI.**
**VISITOR COUNT ONLY.**
**NO TIME-SPENT TRACKING.**
**NO FAKE ANTI-DEVTOOLS SECURITY.**
**NO SECRETS IN FRONTEND.**