/**
 * Cloudflare Worker - Secure Lecture Backend
 * YouTube-based implementation with visitor tracking only
 */

// Configuration from environment
const CONFIG = {
    LECTURE_ID: "lecture-01",
    ALLOWED_ORIGINS: [
        "https://stream-lecture.mahata.site",
        "https://www.stream-lecture.mahata.site",
        "https://mahata.site",
        "https://www.mahata.site",
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],
    RATE_LIMIT_VISITS_PER_MINUTE: 60,
};

/**
 * CORS and security headers helper
 */
function createHeaders(origin = null) {
    const allowedOrigin = CONFIG.ALLOWED_ORIGINS.includes(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0];

    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Cache-Control': 'no-store, max-age=0',
    };
}

/**
 * Validate origin for CORS
 */
function isOriginAllowed(origin) {
    return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

/**
 * Rate limiting helper using KV
 */
async function checkRateLimit(env, key, limit) {
    const kv = env.RATE_LIMIT;
    if (!kv) {
        // KV not bound, skip rate limiting
        return true;
    }

    try {
        const count = await kv.get(key);
        const currentCount = parseInt(count || "0");

        if (currentCount >= limit) {
            return false;
        }

        // Increment counter with 1-minute expiration
        await kv.put(key, (currentCount + 1).toString(), { expirationTtl: 60 });
        return true;
    } catch (error) {
        console.error("Rate limit check error:", error);
        // On error, allow the request
        return true;
    }
}

/**
 * Validate JSON payload
 */
function validateJSON(request) {
    const contentType = request.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
        return null;
    }
    return request.json();
}

/**
 * POST /api/visit
 * Track anonymous visitor
 */
async function handleVisit(request, env) {
    const origin = request.headers.get('Origin');

    // Validate origin
    if (!origin || !isOriginAllowed(origin)) {
        return new Response(JSON.stringify({ error: "Unauthorized origin" }), {
            status: 403,
            headers: createHeaders(origin),
        });
    }

    try {
        // Rate limiting
        const rateLimitKey = `visit-${request.headers.get('CF-Connecting-IP') || 'unknown'}`;
        const isWithinLimit = await checkRateLimit(env, rateLimitKey, CONFIG.RATE_LIMIT_VISITS_PER_MINUTE);

        if (!isWithinLimit) {
            return new Response(JSON.stringify({ success: false }), {
                status: 429,
                headers: createHeaders(origin),
            });
        }

        // Parse request body
        const payload = await validateJSON(request);
        if (!payload) {
            return new Response(JSON.stringify({ error: "Invalid request" }), {
                status: 400,
                headers: createHeaders(origin),
            });
        }

        const { lectureId, sessionId } = payload;

        // Validate inputs
        if (!lectureId || !sessionId) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: createHeaders(origin),
            });
        }

        // Validate lecture ID
        if (lectureId !== CONFIG.LECTURE_ID) {
            return new Response(JSON.stringify({ error: "Lecture not found" }), {
                status: 404,
                headers: createHeaders(origin),
            });
        }

        // Validate session ID format (should be UUID)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
            return new Response(JSON.stringify({ error: "Invalid session ID" }), {
                status: 400,
                headers: createHeaders(origin),
            });
        }

        // Get database
        const db = env.DB;
        if (!db) {
            console.error("Database not bound");
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: createHeaders(origin),
            });
        }

        const now = Math.floor(Date.now() / 1000);

        try {
            // Insert visitor if not already counted
            await db.prepare(`
                INSERT OR IGNORE INTO lecture_visits (session_id, lecture_id, first_seen)
                VALUES (?, ?, ?)
            `).bind(sessionId, lectureId, now).run();

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: createHeaders(origin),
            });
        } catch (dbError) {
            console.error("Database error:", dbError);
            // Return success even if DB fails - don't block visitor
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: createHeaders(origin),
            });
        }

    } catch (error) {
        console.error("Visit endpoint error:", error);
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: createHeaders(origin),
        });
    }
}

/**
 * GET /api/admin/visitor-count
 * Get visitor count (protected - requires authorization header)
 */
async function handleAdminVisitorCount(request, env) {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const adminSecret = env.ADMIN_SECRET || 'changeme-in-production';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const token = authHeader.substring(7);
    if (token !== adminSecret) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const db = env.DB;
        if (!db) {
            return new Response(JSON.stringify({ error: "Database not available" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get visitor count
        const result = await db.prepare(`
            SELECT COUNT(*) as count FROM lecture_visits WHERE lecture_id = ?
        `).bind(CONFIG.LECTURE_ID).first();

        return new Response(JSON.stringify({
            lectureId: CONFIG.LECTURE_ID,
            visitorCount: result?.count || 0,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Admin count error:", error);
        return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

/**
 * GET /api/online-count
 * Get current online visitor count (public)
 */
async function handleOnlineCount(request, env) {
    const origin = request.headers.get('Origin');

    try {
        // In a real implementation, this would query a Durable Objects counter
        // For now, return a reasonable estimate or 0
        // TODO: Implement Durable Objects for realtime presence tracking

        const onlineCount = 0; // Placeholder - implement with Durable Objects for production

        return new Response(JSON.stringify({
            onlineCount: onlineCount,
        }), {
            status: 200,
            headers: createHeaders(origin),
        });
    } catch (error) {
        console.error("Online count error:", error);
        return new Response(JSON.stringify({ onlineCount: 0 }), {
            status: 200,
            headers: createHeaders(origin),
        });
    }
}

/**
 * GET /api/visit-count
 * Get total unique visitor count (public)
 */
async function handleVisitCount(request, env) {
    const origin = request.headers.get('Origin');

    try {
        const db = env.DB;
        if (!db) {
            return new Response(JSON.stringify({ visitCount: 0 }), {
                status: 200,
                headers: createHeaders(origin),
            });
        }

        // Get total unique visitor count for this lecture
        const result = await db.prepare(`
            SELECT COUNT(*) as count FROM lecture_visits WHERE lecture_id = ?
        `).bind(CONFIG.LECTURE_ID).first();

        return new Response(JSON.stringify({
            lectureId: CONFIG.LECTURE_ID,
            visitCount: result?.count || 0,
        }), {
            status: 200,
            headers: createHeaders(origin),
        });

    } catch (error) {
        console.error("Visit count error:", error);
        return new Response(JSON.stringify({ visitCount: 0 }), {
            status: 200,
            headers: createHeaders(origin),
        });
    }
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function handleOptions(origin) {
    return new Response(null, {
        status: 204,
        headers: createHeaders(origin),
    });
}

/**
 * Main router
 */
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (request.method === 'OPTIONS') {
        return handleOptions(origin);
    }

    // Route to appropriate handler
    if (url.pathname === '/api/visit' && request.method === 'POST') {
        return handleVisit(request, env);
    }

    if (url.pathname === '/api/online-count' && request.method === 'GET') {
        return handleOnlineCount(request, env);
    }

    if (url.pathname === '/api/visit-count' && request.method === 'GET') {
        return handleVisitCount(request, env);
    }

    if (url.pathname === '/api/admin/visitor-count' && request.method === 'GET') {
        return handleAdminVisitorCount(request, env);
    }

    // 404
    return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Export handler
 */
export default {
    fetch: handleRequest,
};
