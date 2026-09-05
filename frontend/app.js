/**
 * Secure Lecture Frontend with Custom YouTube Player
 * Uses official YouTube IFrame Player API
 * Anonymous visitor tracking only (no watch-time tracking)
 */

class LecturePlayer {
    constructor(config) {
        this.config = config;
        this.sessionId = this.getOrCreateSessionId();
        this.player = null;
        this.isPlayerReady = false;
        this.apiBaseUrl = this.getApiBaseUrl();
        this.isSeeking = false;
        this.updateIntervalId = null;

        // Player state
        this.isPlaying = false;
        this.currentVolume = 100;
        this.isMuted = false;
        this.captionsEnabled = false;

        // Initialize top click shield
        this.setupTopClickShield();

        this.init();
    }

    /**
     * Setup the top click shield to prevent YouTube title/channel clicks
     */
    setupTopClickShield() {
        const shield = document.getElementById('youtubeTopClickShield');
        if (!shield) return;

        // Prevent all pointer events from reaching YouTube iframe
        const preventEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        };

        // Mouse events
        shield.addEventListener('click', preventEvent, true);
        shield.addEventListener('mousedown', preventEvent, true);
        shield.addEventListener('mouseup', preventEvent, true);
        shield.addEventListener('dblclick', preventEvent, true);

        // Touch events (mobile)
        shield.addEventListener('touchstart', preventEvent, true);
        shield.addEventListener('touchmove', preventEvent, true);
        shield.addEventListener('touchend', preventEvent, true);

        // Pointer events (modern)
        shield.addEventListener('pointerdown', preventEvent, true);
        shield.addEventListener('pointermove', preventEvent, true);
        shield.addEventListener('pointerup', preventEvent, true);

        // Contextmenu (right click)
        shield.addEventListener('contextmenu', preventEvent, true);

        // Drag events
        shield.addEventListener('dragstart', preventEvent, true);
        shield.addEventListener('drag', preventEvent, true);
        shield.addEventListener('dragend', preventEvent, true);

        // Make sure the shield stays on top and blocks interaction
        shield.style.zIndex = '18';
        shield.style.pointerEvents = 'auto';

        console.log('Top click shield initialized');
    }

    /**
     * Get or create an anonymous session ID
     * Uses sessionStorage so each browser session is counted once
     */
    getOrCreateSessionId() {
        const storageKey = 'lecture-session-id';
        let sessionId = sessionStorage.getItem(storageKey);

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem(storageKey, sessionId);
        }

        return sessionId;
    }

    /**
     * Determine API base URL based on deployment
     */
    getApiBaseUrl() {
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:8787';
        }
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
            });

            // Wait for YouTube API to be loaded
            this.waitForYouTubeAPI().then(() => {
                this.createPlayer();
            });

            // Monitor wrapper for resize to maintain shield positioning
            this.setupShieldResizeObserver();

        } catch (error) {
            console.error('Failed to initialize player:', error);
            this.showError();
        }
    }

    /**
     * Setup ResizeObserver to keep shield properly positioned during resize
     */
    setupShieldResizeObserver() {
        const wrapper = document.getElementById('player-wrapper');
        if (!wrapper || !('ResizeObserver' in window)) return;

        const shield = document.getElementById('youtubeTopClickShield');
        const mask = document.getElementById('youtubeTopMask');

        const resizeObserver = new ResizeObserver(() => {
            if (shield && mask) {
                // Ensure shield covers the top area even after resize
                const rect = wrapper.getBoundingClientRect();
                console.log('Player resized - shield repositioned');
            }
        });

        resizeObserver.observe(wrapper);
    }

    /**
     * Wait for YouTube API to be ready
     */
    waitForYouTubeAPI() {
        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                resolve();
            } else {
                window.onYouTubeIframeAPIReady = () => {
                    resolve();
                };
            }
        });
    }

    /**
     * Create YouTube player with official API
     * Uses responsive container sizing (not fixed pixel dimensions)
     */
    createPlayer() {
        try {
            const playerId = 'youtube-player';
            const container = document.getElementById(playerId);

            // Get actual container dimensions for proper initialization
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || (window.innerWidth * 9 / 16);

            this.player = new window.YT.Player(playerId, {
                width: width,
                height: height,
                videoId: this.config.youtubeVideoId,
                playerVars: {
                    'controls': 0,           // Hide YouTube controls
                    'playsinline': 1,        // Play inline on mobile
                    'rel': 0,                // No related videos from other channels
                    'modestbranding': 1,     // Minimal YouTube branding
                    'enablejsapi': 1,        // Enable JavaScript API
                    'fs': 1,                 // Allow fullscreen
                    'iv_load_policy': 3      // Hide video annotations
                },
                events: {
                    'onReady': (event) => this.onPlayerReady(event),
                    'onStateChange': (event) => this.onPlayerStateChange(event),
                    'onError': (event) => this.onPlayerError(event)
                }
            });

        } catch (error) {
            console.error('Error creating player:', error);
            this.showError('Failed to create video player');
        }
    }

    /**
     * Handle player ready event
     */
    onPlayerReady(event) {
        this.isPlayerReady = true;

        // Show player and hide loading
        document.getElementById('player-wrapper').style.display = 'block';
        this.hideLoading();

        // Set initial volume
        this.player.setVolume(100);
        this.currentVolume = 100;

        // Setup control event listeners
        this.setupControls();

        // Start update interval for progress bar
        this.startProgressUpdate();

        // Initialize captions button state
        this.updateCaptionsButton();

        // Ensure click shield is properly layered
        this.ensureShieldLayering();

        // Handle fullscreen changes
        this.setupFullscreenListener();
    }

    /**
     * Ensure the top click shield stays properly layered above the iframe
     */
    ensureShieldLayering() {
        const wrapper = document.getElementById('player-wrapper');
        const shield = document.getElementById('youtubeTopClickShield');
        const mask = document.getElementById('youtubeTopMask');
        const iframe = document.getElementById('youtube-player');

        if (!shield || !wrapper) return;

        // Set z-index hierarchy
        if (iframe) {
            iframe.style.position = 'relative';
            iframe.style.zIndex = '1';
        }
        if (mask) {
            mask.style.position = 'absolute';
            mask.style.zIndex = '15';
        }
        shield.style.position = 'absolute';
        shield.style.zIndex = '18';

        console.log('Shield layering ensured - z-index: shield=18, mask=15, iframe=1');
    }

    /**
     * Setup fullscreen listener to maintain shield visibility
     */
    setupFullscreenListener() {
        const wrapper = document.getElementById('player-wrapper');
        if (!wrapper) return;

        const updateShieldOnFullscreen = () => {
            const shield = document.getElementById('youtubeTopClickShield');
            const mask = document.getElementById('youtubeTopMask');

            if (document.fullscreenElement || document.webkitFullscreenElement) {
                // In fullscreen
                if (shield) shield.style.zIndex = '999998';
                if (mask) mask.style.zIndex = '999997';
                console.log('Fullscreen entered - shield z-index updated');
            } else {
                // Exited fullscreen
                if (shield) shield.style.zIndex = '18';
                if (mask) mask.style.zIndex = '15';
                console.log('Fullscreen exited - shield z-index restored');
            }
        };

        document.addEventListener('fullscreenchange', updateShieldOnFullscreen);
        document.addEventListener('webkitfullscreenchange', updateShieldOnFullscreen);
        document.addEventListener('mozfullscreenchange', updateShieldOnFullscreen);
        document.addEventListener('MSFullscreenChange', updateShieldOnFullscreen);

        // Also listen for window resize to maintain shield
        window.addEventListener('resize', () => {
            this.ensureShieldLayering();
        });
    }

    /**
     * Handle player state changes
     */
    onPlayerStateChange(event) {
        const stateNames = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'video cued'
        };

        const state = stateNames[event.data] || 'unknown';

        if (event.data === window.YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.updatePlayPauseButton();
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.updatePlayPauseButton();
        }
    }

    /**
     * Handle player errors
     */
    onPlayerError(event) {
        console.error('YouTube Player Error:', event.data);

        let errorMsg = 'Unable to load the lecture video. Please refresh the page.';

        switch(event.data) {
            case 2:
                errorMsg = 'Invalid video ID.';
                break;
            case 5:
                errorMsg = 'HTML5 player error.';
                break;
            case 100:
                errorMsg = 'Video not found (may be removed or private).';
                break;
            case 101:
            case 150:
                errorMsg = 'Video cannot be embedded.';
                break;
        }

        this.showError(errorMsg);
    }

    /**
     * Setup control event listeners
     */
    setupControls() {
        // Play/Pause button
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            if (this.isPlaying) {
                this.player.pauseVideo();
            } else {
                this.player.playVideo();
            }
        });

        // Backward 10 seconds
        document.getElementById('backwardBtn').addEventListener('click', () => {
            const currentTime = this.player.getCurrentTime();
            const newTime = Math.max(0, currentTime - 10);
            this.player.seekTo(newTime);
        });

        // Forward 20 seconds
        document.getElementById('forwardBtn').addEventListener('click', () => {
            const currentTime = this.player.getCurrentTime();
            const duration = this.player.getDuration();
            const newTime = Math.min(duration, currentTime + 20);
            this.player.seekTo(newTime);
        });

        // Progress bar - mouse events
        const progressBar = document.getElementById('progressBar');
        progressBar.addEventListener('mousedown', (e) => this.handleProgressMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleProgressMouseMove(e));
        document.addEventListener('mouseup', () => this.handleProgressMouseUp());

        // Progress bar - touch events (mobile)
        progressBar.addEventListener('touchstart', (e) => this.handleProgressMouseDown(e));
        document.addEventListener('touchmove', (e) => this.handleProgressMouseMove(e));
        document.addEventListener('touchend', () => this.handleProgressMouseUp());

        // Volume slider
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.player.setVolume(volume);
            this.currentVolume = volume;
            this.updateMuteButton();
        });

        // Mute button
        document.getElementById('muteBtn').addEventListener('click', () => {
            if (this.isMuted) {
                this.player.unMute();
                this.isMuted = false;
            } else {
                this.player.mute();
                this.isMuted = true;
            }
            this.updateMuteButton();
        });

        // Speed selector
        document.getElementById('speedSelector').addEventListener('change', (e) => {
            const speed = parseFloat(e.target.value);
            if (this.player.setPlaybackRate) {
                this.player.setPlaybackRate(speed);
            }
        });

        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Captions button
        document.getElementById('captionsBtn').addEventListener('click', () => {
            this.toggleCaptions();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // C key for captions
            if (e.key.toLowerCase() === 'c' && this.isPlayerReady) {
                this.toggleCaptions();
            }
        });
    }

    /**
     * Handle progress bar mouse/touch down
     */
    handleProgressMouseDown(e) {
        this.isSeeking = true;
        this.updateProgressFromEvent(e);
    }

    /**
     * Handle progress bar mouse/touch move
     */
    handleProgressMouseMove(e) {
        if (!this.isSeeking || !this.isPlayerReady) return;
        this.updateProgressFromEvent(e);
    }

    /**
     * Handle progress bar mouse/touch up
     */
    handleProgressMouseUp() {
        this.isSeeking = false;
    }

    /**
     * Update progress from mouse/touch event
     */
    updateProgressFromEvent(e) {
        if (!this.isPlayerReady) return;

        const progressBar = document.getElementById('progressBar');
        const rect = progressBar.getBoundingClientRect();

        let clientX = e.clientX;
        if (e.touches) {
            clientX = e.touches[0].clientX;
        }

        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const duration = this.player.getDuration();
        const newTime = percentage * duration;

        // Update visual progress
        this.updateProgressBar(percentage);

        // Seek video
        this.player.seekTo(newTime);
    }

    /**
     * Start progress bar update interval
     */
    startProgressUpdate() {
        if (this.updateIntervalId) clearInterval(this.updateIntervalId);

        this.updateIntervalId = setInterval(() => {
            if (!this.isPlayerReady || this.isSeeking) return;

            const currentTime = this.player.getCurrentTime();
            const duration = this.player.getDuration();

            if (duration > 0) {
                const percentage = currentTime / duration;
                this.updateProgressBar(percentage);
                this.updateTimeDisplay(currentTime, duration);
            }
        }, 100);
    }

    /**
     * Update progress bar visually
     */
    updateProgressBar(percentage) {
        const progressFill = document.getElementById('progressFill');
        const progressHandle = document.getElementById('progressHandle');

        progressFill.style.width = (percentage * 100) + '%';
        progressHandle.style.left = (percentage * 100) + '%';
    }

    /**
     * Update time display
     */
    updateTimeDisplay(currentTime, duration) {
        document.getElementById('currentTime').textContent = this.formatTime(currentTime);
        document.getElementById('duration').textContent = this.formatTime(duration);
    }

    /**
     * Format seconds to MM:SS or HH:MM:SS
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * Update play/pause button icon
     */
    updatePlayPauseButton() {
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const btn = document.getElementById('playPauseBtn');

        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            btn.setAttribute('title', 'Pause');
            btn.setAttribute('aria-label', 'Pause');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            btn.setAttribute('title', 'Play');
            btn.setAttribute('aria-label', 'Play');
        }
    }

    /**
     * Update mute button icon
     */
    updateMuteButton() {
        const volumeHighIcon = document.getElementById('volumeHighIcon');
        const volumeMutedIcon = document.getElementById('volumeMutedIcon');
        const btn = document.getElementById('muteBtn');

        if (this.isMuted || this.currentVolume === 0) {
            volumeHighIcon.style.display = 'none';
            volumeMutedIcon.style.display = 'block';
            btn.setAttribute('title', 'Unmute');
            btn.setAttribute('aria-label', 'Unmute');
        } else {
            volumeHighIcon.style.display = 'block';
            volumeMutedIcon.style.display = 'none';
            btn.setAttribute('title', 'Mute');
            btn.setAttribute('aria-label', 'Mute');
        }
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const playerWrapper = document.getElementById('player-wrapper');

        if (!document.fullscreenElement) {
            if (playerWrapper.requestFullscreen) {
                playerWrapper.requestFullscreen();
            } else if (playerWrapper.webkitRequestFullscreen) {
                playerWrapper.webkitRequestFullscreen();
            } else if (playerWrapper.mozRequestFullScreen) {
                playerWrapper.mozRequestFullScreen();
            } else if (playerWrapper.msRequestFullscreen) {
                playerWrapper.msRequestFullscreen();
            }
            this.updateFullscreenButton(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.updateFullscreenButton(false);
        }
    }

    /**
     * Toggle captions
     */
    toggleCaptions() {
        this.captionsEnabled = !this.captionsEnabled;
        this.updateCaptionsButton();

        if (this.player && this.player.loadModule) {
            // Enable/disable captions via YouTube API
            const captionsModule = this.player.getModule('captions');
            if (captionsModule) {
                if (this.captionsEnabled) {
                    captionsModule.setDisplaySettings({});
                } else {
                    captionsModule.setDisplaySettings(null);
                }
            }
        }

        console.log('Captions ' + (this.captionsEnabled ? 'enabled' : 'disabled'));
    }

    /**
     * Update captions button icon
     */
    updateCaptionsButton() {
        const btn = document.getElementById('captionsBtn');

        if (this.captionsEnabled) {
            btn.classList.add('active');
            btn.setAttribute('title', 'Captions On (C)');
            btn.setAttribute('aria-label', 'Captions On');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('title', 'Captions Off (C)');
            btn.setAttribute('aria-label', 'Captions Off');
        }
    }

    /**
     * Update fullscreen button icon
     */
    updateFullscreenButton(isFullscreen) {
        const fullscreenIcon = document.getElementById('fullscreenIcon');
        const fullscreenExitIcon = document.getElementById('fullscreenExitIcon');

        if (isFullscreen) {
            fullscreenIcon.style.display = 'none';
            fullscreenExitIcon.style.display = 'block';
        } else {
            fullscreenIcon.style.display = 'block';
            fullscreenExitIcon.style.display = 'none';
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
        }
    }

    /**
     * Show loading state
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

        const retryButton = document.getElementById('retry-button');
        retryButton.onclick = () => {
            location.reload();
        };
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        if (this.updateIntervalId) {
            clearInterval(this.updateIntervalId);
        }
        if (this.player) {
            this.player.destroy();
        }
    }
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Validate configuration
    if (!LECTURE_CONFIG.youtubeVideoId || LECTURE_CONFIG.youtubeVideoId === 'YOUR_YOUTUBE_VIDEO_ID') {
        console.error('YouTube video ID not configured');
        return;
    }

    // Initialize player
    const player = new LecturePlayer(LECTURE_CONFIG);

    // Expose for debugging (optional)
    window.__lecturePlayer = player;

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        player.destroy();
    });
});

/**
 * Security & Privacy Notes:
 * - Uses official YouTube IFrame Player API (no video extraction)
 * - YouTube video ID is public (required for player to work)
 * - Custom controls are local-only (no tracking of playback)
 * - No watch-time tracking sent to backend
 * - No download functionality implemented
 * - No fingerprinting or DevTools detection
 * - Session ID is anonymous and random (only for visitor counting)
 * - All communications use HTTPS
 */
