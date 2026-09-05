/**
 * Secure Lecture Frontend
 * YouTube-based implementation with anonymous visitor tracking
 */

class LecturePlayer {
    constructor(config) {
        this.config = config;
        this.sessionId = this.getOrCreateSessionId();
        this.isInitialized = false;
        this.apiBaseUrl = this.getApiBaseUrl();
        this.init();
    }

    /**
     * Get or create an anonymous session ID
     * Uses sessionStorage so each browser session is counted once
     */
    getOrCreateSessionId() {
        const storageKey = 'lecture-session-id';
        let sessionId = sessionStorage.getItem(storageKey);

        if (!sessionId) {
            // Generate a new random session ID for this browser session
            sessionId = crypto.randomUUID();
            sessionStorage.setItem(storageKey, sessionId);
        }

        return sessionId;
    }

    /**
     * Determine API base URL based on deployment
     */
    getApiBaseUrl() {
        // Development
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:8787';
        }

        // Production - use same domain
        return `${window.location.protocol}//${window.location.host}`;
    }

    /**
     * Initialize the player
     */
    async init() {
        try {
            // Track visitor visit (fire and forget - don't block on this)
            this.trackVisit().catch(err => {
                console.warn('Failed to track visit:', err);
                // Continue with playback even if tracking fails
            });

            // Load the YouTube player
            this.loadPlayer();

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize player:', error);
            this.showError();
        }
    }

    /**
     * Track anonymous visitor
     */
    async trackVisit() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lectureId: this.config.id,
                    sessionId: this.sessionId,
                }),
                credentials: 'omit',
            });

            if (!response.ok) {
                console.warn('Failed to track visit:', response.status);
            }
        } catch (error) {
            console.error('Error tracking visit:', error);
            // Don't throw - visitor tracking failure should not block playback
        }
    }

    /**
     * Load the YouTube player
     */
    loadPlayer() {
        const playerWrapper = document.getElementById('player-wrapper');

        // Validate video ID
        if (!this.config.youtubeVideoId || this.config.youtubeVideoId === 'YOUR_YOUTUBE_VIDEO_ID') {
            this.showError('YouTube video ID not configured');
            return;
        }

        // YouTube embed with unlisted video
        // rel=0 prevents showing related videos from other channels
        const playerHTML = `
            <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/${this.config.youtubeVideoId}?rel=0&modestbranding=1"
                title="Lecture Video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;

        playerWrapper.innerHTML = playerHTML;
        playerWrapper.style.display = 'block';

        this.hideLoading();
    }

    /**
     * Show loading state
     */
    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');

        loadingState.style.display = 'flex';
        errorState.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        loadingState.style.display = 'none';
    }

    /**
     * Show error state with retry option
     */
    showError(message = null) {
        const errorState = document.getElementById('error-state');
        const loadingState = document.getElementById('loading-state');
        const errorMessage = document.getElementById('error-message');

        if (message) {
            errorMessage.textContent = message;
        }

        loadingState.style.display = 'none';
        errorState.style.display = 'flex';

        // Set up retry button
        const retryButton = document.getElementById('retry-button');
        retryButton.addEventListener('click', () => {
            this.init();
        });
    }
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Validate configuration
    if (!LECTURE_CONFIG.youtubeVideoId || LECTURE_CONFIG.youtubeVideoId === 'YOUR_YOUTUBE_VIDEO_ID') {
        console.error('YouTube video ID not configured');
        // Still show error but continue with initialization
    }

    // Initialize player
    const player = new LecturePlayer(LECTURE_CONFIG);

    // Expose for debugging (optional)
    window.__lecturePlayer = player;
});

/**
 * Security notes (YouTube):
 * - Video is hosted on YouTube (unlisted, not searchable)
 * - Unlisted videos can be watched by anyone with the link
 * - YouTube handles video security and DRM
 * - Session ID is anonymous and random
 * - No fingerprinting or persistent tracking
 * - Backend visitor tracking is optional
 * - All communications use HTTPS
 */
