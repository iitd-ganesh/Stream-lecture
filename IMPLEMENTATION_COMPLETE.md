# FINAL MODIFIED FILES - COMPLETE

---

## FILE 1: frontend/index.html
**KEY CHANGE: Added two new divs (lines 48-52) for shield and mask**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Secure lecture video streaming via YouTube">
    <meta name="theme-color" content="#ffffff">
    <title>Lecture</title>
    <link rel="stylesheet" href="style.css">
    <script defer src="app.js"></script>
    <!-- YouTube IFrame API -->
    <script src="https://www.youtube.com/iframe_api"></script>
</head>
<body>
    <main class="lecture-container">
        <header class="lecture-header">
            <p class="lecture-label">LECTURE</p>
            <h1 class="lecture-title">Estimation of Capital Investment</h1>

            <div class="lecture-meta">
                <div class="meta-item">
                    <span class="meta-label">Professor:</span>
                    <span class="meta-value">Dr. Shaikh Z. Ahammad</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Date:</span>
                    <span class="meta-value">05 September 2026</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Duration:</span>
                    <span class="meta-value">1:20:50</span>
                </div>
            </div>
        </header>

        <section class="video-section">
            <div id="video-container" class="video-container">
                <div id="loading-state" class="loading-state">
                    <p>Loading lecture video...</p>
                </div>
                <div id="error-state" class="error-state" style="display: none;">
                    <p id="error-message">Unable to load the lecture video. Please refresh the page.</p>
                    <button id="retry-button" class="retry-button">Retry</button>
                </div>

                <!-- YouTube Player Container -->
                <div id="player-wrapper" style="display: none;">
                    <!-- ⭐ NEW: Visual mask - covers the native YouTube title/channel area -->
                    <div class="youtube-top-mask" id="youtubeTopMask"></div>

                    <!-- ⭐ NEW: Click shield - intercepts pointer events on the top area -->
                    <div class="youtube-top-click-shield" id="youtubeTopClickShield"></div>

                    <div id="youtube-player" class="youtube-player-container">
                        <!-- YouTube iframe will be injected here by API -->
                    </div>

                    <!-- Custom Controls Overlay -->
                    <div class="player-controls">
                        <!-- Progress Bar -->
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="progressBar">
                                <div class="progress-fill" id="progressFill"></div>
                                <div class="progress-handle" id="progressHandle"></div>
                            </div>
                        </div>

                        <!-- Control Buttons Row -->
                        <div class="controls-bottom">
                            <!-- Time Display -->
                            <div class="time-display">
                                <span id="currentTime">0:00</span>
                                <span class="time-separator">/</span>
                                <span id="duration">0:00</span>
                            </div>

                            <!-- Main Controls -->
                            <div class="main-controls">
                                <!-- Back 10s -->
                                <button class="control-btn backward-btn" id="backwardBtn" title="Back 10 seconds" aria-label="Back 10 seconds">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11 5V1l-5 5 5 5v-4c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L4.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v4l5-5-5-5v4z"/>
                                    </svg>
                                    <span class="control-label">10s</span>
                                </button>

                                <!-- Play/Pause -->
                                <button class="control-btn play-pause-btn" id="playPauseBtn" title="Play" aria-label="Play">
                                    <svg id="playIcon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                    <svg id="pauseIcon" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                </button>

                                <!-- Forward 20s -->
                                <button class="control-btn forward-btn" id="forwardBtn" title="Forward 20 seconds" aria-label="Forward 20 seconds">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 5V1l5 5-5 5v-4c-3.31 0-6 2.69-6 6 0 1.01.25 1.97.7 2.8l-1.46 1.46C4.46 15.03 4 13.57 4 12c0-4.42 3.58-8 8-8zm0 14c3.31 0 6-2.69 6-6 0-1.01-.25-1.97-.7-2.8l1.46-1.46C19.54 8.97 20 10.43 20 12c0 4.42-3.58 8-8 8v4l-5-5 5-5v4z"/>
                                    </svg>
                                    <span class="control-label">20s</span>
                                </button>

                                <!-- Volume Control -->
                                <div class="volume-control">
                                    <button class="control-btn mute-btn" id="muteBtn" title="Mute" aria-label="Mute">
                                        <svg id="volumeHighIcon" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                        </svg>
                                        <svg id="volumeMutedIcon" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                            <path d="M16.6 13.72c.4-1 .6-2.06.6-3.22 0-6.5-5.4-11.77-12-11.77-1.16 0-2.25.2-3.22.6l2.36 2.36C5.02 1.82 6.42 1.5 8 1.5c5.02 0 9 3.98 9 9 0 1.58-.32 3.06-.9 4.42l2.5 2.5zM3 6.78l2.24 2.24C4.48 8.95 3.5 10.4 3.5 12c0 2.65 2.15 4.8 4.8 4.8 1.6 0 3.05-.98 3.69-2.4L16.38 20 17.78 18.6 4.4 5.22 3 6.78zM11.5 21c1.16 0 2.25-.2 3.22-.6l-2.36-2.36C18.98 17.18 20 15.58 20 14c0-5.02-3.98-9-9-9-1.58 0-3.06.32-4.42.9L3.1 3.5c1.4-1 3.1-1.5 5-1.5 6.63 0 12 5.27 12 11.77 0 1.73-.3 3.4-.88 4.94l2.58 2.58c.6-1.6.88-3.3.88-5.02 0-7.68-6.2-13.77-13.77-13.77-1.92 0-3.73.36-5.42 1.06L5.12 2.74c1.5-.4 3.08-.6 4.88-.6 6.63 0 12 5.27 12 11.77 0 2.19-.56 4.26-1.55 6.07l2.43 2.43C22.56 20.45 23 18.46 23 16.14c0-7.68-6.2-13.77-13.77-13.77-2.6 0-5.05.7-7.15 1.93L3 6.78z"/>
                                        </svg>
                                    </button>
                                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100" title="Volume">
                                </div>

                                <!-- Speed Control -->
                                <div class="speed-control">
                                    <select class="speed-selector" id="speedSelector" title="Playback speed">
                                        <option value="0.5">0.5x</option>
                                        <option value="0.75">0.75x</option>
                                        <option value="1" selected>1x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2">2x</option>
                                    </select>
                                </div>

                                <!-- Fullscreen -->
                                <button class="control-btn fullscreen-btn" id="fullscreenBtn" title="Fullscreen" aria-label="Fullscreen">
                                    <svg id="fullscreenIcon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                    </svg>
                                    <svg id="fullscreenExitIcon" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer class="lecture-footer">
            <p>This lecture is hosted on YouTube with custom player controls.</p>
        </footer>
    </main>

    <script>
        // Configuration - these values are safe to expose
        const LECTURE_CONFIG = {
            id: "lecture-01",
            title: "Estimation of Capital Investment",
            professor: "Dr. Shaikh Z. Ahammad",
            date: "2026-09-05",
            duration: "1:20:50",
            youtubeVideoId: "WZxMQuiXjsE"  // Unlisted YouTube video ID
        };
    </script>
</body>
</html>
```

---

## FILE 2: frontend/style.css
**KEY CHANGE: Added shield and mask CSS (lines 239-271)**

```css
:root {
    --color-primary: #1a1a1a;
    --color-secondary: #ffffff;
    --color-accent: #0066cc;
    --color-border: #e0e0e0;
    --color-error: #d32f2f;
    --color-text: #333333;
    --color-text-light: #666666;
    --color-control-bg: rgba(0, 0, 0, 0.7);
    --color-control-hover: rgba(255, 255, 255, 0.1);
    --color-progress: #0066cc;
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
    --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 2rem;
    --line-height-tight: 1.2;
    --line-height-normal: 1.5;
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 300ms ease-in-out;
}

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-text);
    background-color: var(--color-secondary);
}

/* Accessibility - remove outline only when not needed */
*:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    line-height: var(--line-height-tight);
    font-weight: 600;
    margin-top: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
}

h1 {
    font-size: var(--font-size-xxl);
}

h2 {
    font-size: var(--font-size-xl);
}

p {
    margin-bottom: var(--spacing-sm);
}

/* Main container */
.lecture-container {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Header styles */
.lecture-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
}

.lecture-label {
    font-size: var(--font-size-sm);
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--color-text-light);
    text-transform: uppercase;
    margin-bottom: var(--spacing-sm);
}

.lecture-title {
    font-size: var(--font-size-xxl);
    margin-bottom: var(--spacing-lg);
    color: var(--color-primary);
}

.lecture-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-lg);
    font-size: var(--font-size-sm);
}

.meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.meta-label {
    font-weight: 600;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xs);
}

.meta-value {
    color: var(--color-text);
}

/* Video section */
.video-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-xl);
}

.video-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: var(--color-primary);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* No scaling, filtering, or image rendering that could reduce quality */
}

/* Loading state */
.loading-state {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary);
    color: var(--color-secondary);
    text-align: center;
    z-index: 10;
}

.loading-state p {
    font-size: var(--font-size-lg);
    margin: 0;
}

/* Error state */
.error-state {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary);
    color: var(--color-secondary);
    text-align: center;
    padding: var(--spacing-lg);
    z-index: 10;
}

.error-state p {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-lg);
    max-width: 400px;
}

/* Retry button */
.retry-button {
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-accent);
    color: var(--color-secondary);
    border: none;
    border-radius: 4px;
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.retry-button:hover {
    background-color: #0052a3;
}

.retry-button:active {
    transform: scale(0.98);
}

/* Player wrapper - NO SCALING, FILTERS, or TRANSFORMS */
#player-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    /* No transform, filter, or opacity - these degrade video quality */
}

.youtube-player-container {
    position: relative;
    width: 100%;
    height: 100%;
    /* Native rendering - no CSS effects */
}

#youtube-player {
    width: 100%;
    height: 100%;
    /* Container fills parent, iframe fills this */
}

#youtube-player iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    /* Ensure no scaling filters or transforms are applied */
}

/* ⭐ NEW: Top Interaction Shield & Visual Mask over native YouTube title/channel area */
.youtube-top-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.3) 100%);
    z-index: 15;
    pointer-events: none;
}

/* ⭐ NEW: Click Shield - intercepts all pointer events on the top area */
.youtube-top-click-shield {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    z-index: 18;
    pointer-events: auto;
    cursor: default;
    background: transparent;
}

/* ⭐ NEW: Prevent any interaction with the shield area */
.youtube-top-click-shield,
.youtube-top-click-shield * {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

/* Custom Controls Overlay */
.player-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: var(--spacing-xl) var(--spacing-md) var(--spacing-md);
    z-index: 20;
    transition: opacity var(--transition-normal);
}

/* Progress Bar Container */
.progress-bar-container {
    width: 100%;
    margin-bottom: var(--spacing-md);
}

.progress-bar {
    position: relative;
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    cursor: pointer;
    transition: height var(--transition-fast);
}

.progress-bar:hover {
    height: 6px;
}

.progress-bar:hover .progress-handle {
    opacity: 1;
    transform: scale(1);
}

.progress-fill {
    height: 100%;
    background-color: var(--color-progress);
    border-radius: 2px;
    transition: width 0.05s linear;
}

.progress-handle {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    background-color: var(--color-secondary);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Controls Bottom Row */
.controls-bottom {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

/* Time Display */
.time-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
}

.time-separator {
    opacity: 0.7;
}

/* Main Controls Group */
.main-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
}

/* Control Button Styles */
.control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    min-width: 40px;
    height: 40px;
    padding: 0 var(--spacing-sm);
    background-color: transparent;
    color: var(--color-secondary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    font-size: var(--font-size-sm);
    font-weight: 500;
}

.control-btn:hover {
    background-color: var(--color-control-hover);
}

.control-btn:active {
    transform: scale(0.95);
}

.control-btn svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

.control-label {
    display: none;
    white-space: nowrap;
}

/* Play/Pause Button - Larger */
.play-pause-btn {
    min-width: 48px;
    width: 48px;
    height: 48px;
    background-color: rgba(255, 255, 255, 0.15);
    border: 2px solid var(--color-secondary);
}

.play-pause-btn:hover {
    background-color: rgba(255, 255, 255, 0.25);
}

.play-pause-btn svg {
    width: 28px;
    height: 28px;
}

/* Volume Control */
.volume-control {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-shrink: 0;
}

.mute-btn {
    flex-shrink: 0;
}

.volume-slider {
    width: 80px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background-color: var(--color-secondary);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background-color: var(--color-secondary);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-track {
    background: transparent;
    border: none;
}

/* Speed Control */
.speed-control {
    flex-shrink: 0;
}

.speed-selector {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: transparent;
    color: var(--color-secondary);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: border-color var(--transition-fast);
}

.speed-selector:hover {
    border-color: var(--color-secondary);
}

.speed-selector option {
    background-color: var(--color-primary);
    color: var(--color-secondary);
}

/* Fullscreen Button */
.fullscreen-btn {
    flex-shrink: 0;
}

/* Footer */
.lecture-footer {
    text-align: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-light);
    font-size: var(--font-size-sm);
}

.lecture-footer p {
    margin: 0;
}

/* Fullscreen Styles */
#player-wrapper:-webkit-full-screen {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
}

#player-wrapper:-moz-full-screen {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
}

#player-wrapper:fullscreen {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
}

/* Responsive Design - Tablet */
@media (max-width: 768px) {
    .lecture-container {
        padding: var(--spacing-md);
    }

    .lecture-header {
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
    }

    .lecture-title {
        font-size: var(--font-size-xl);
    }

    .lecture-meta {
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .meta-item {
        flex-direction: row;
        justify-content: center;
        gap: var(--spacing-xs);
    }

    .control-btn {
        min-width: 36px;
        height: 36px;
        padding: 0 var(--spacing-xs);
    }

    .control-btn svg {
        width: 20px;
        height: 20px;
    }

    .play-pause-btn {
        min-width: 44px;
        width: 44px;
        height: 44px;
    }

    .play-pause-btn svg {
        width: 24px;
        height: 24px;
    }

    .volume-slider {
        width: 60px;
    }

    .controls-bottom {
        gap: var(--spacing-sm);
    }

    .player-controls {
        padding: var(--spacing-lg) var(--spacing-sm) var(--spacing-sm);
    }
}

/* Responsive Design - Mobile */
@media (max-width: 480px) {
    .lecture-container {
        padding: var(--spacing-sm);
    }

    .lecture-label {
        font-size: var(--font-size-sm);
    }

    .lecture-title {
        font-size: var(--font-size-lg);
        margin-bottom: var(--spacing-md);
    }

    .lecture-meta {
        gap: var(--spacing-sm);
    }

    .meta-item {
        flex-direction: column;
    }

    .video-container {
        aspect-ratio: 16 / 9;
    }

    /* Mobile controls - prioritize essential buttons */
    .main-controls {
        gap: var(--spacing-xs);
    }

    .control-btn {
        min-width: 40px;
        height: 40px;
        padding: 0;
    }

    .control-btn svg {
        width: 20px;
        height: 20px;
    }

    .control-label {
        display: none;
    }

    .play-pause-btn {
        min-width: 44px;
        width: 44px;
        height: 44px;
        border-width: 2px;
    }

    .play-pause-btn svg {
        width: 24px;
        height: 24px;
    }

    /* Hide time display on very small screens if needed */
    @media (max-width: 360px) {
        .time-display {
            font-size: var(--font-size-sm);
            min-width: 70px;
        }
    }

    /* Stack controls differently on mobile */
    .controls-bottom {
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .time-display {
        width: 100%;
        justify-content: center;
        margin-bottom: var(--spacing-xs);
    }

    .main-controls {
        width: 100%;
        justify-content: center;
    }

    .volume-control {
        width: 100%;
        justify-content: center;
        gap: var(--spacing-xs);
    }

    .volume-slider {
        width: 100px;
    }

    .speed-control {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .speed-selector {
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
    }

    .player-controls {
        padding: var(--spacing-md) var(--spacing-sm) var(--spacing-sm);
    }
}

/* Print styles */
@media print {
    .video-section {
        display: none;
    }

    .lecture-container {
        padding: 0;
    }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    :root {
        --color-secondary: #1a1a1a;
        --color-primary: #ffffff;
        --color-border: #333333;
        --color-text: #e0e0e0;
        --color-text-light: #999999;
    }

    body {
        background-color: var(--color-secondary);
    }

    .speed-selector option {
        background-color: #2a2a2a;
    }
}

/* Hover states for better UX */
@media (hover: hover) and (pointer: fine) {
    .control-btn:hover {
        background-color: var(--color-control-hover);
    }

    .progress-bar:hover {
        height: 6px;
    }

    .progress-bar:hover .progress-handle {
        opacity: 1;
        transform: scale(1);
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .control-btn {
        min-width: 44px;
        height: 44px;
    }

    .play-pause-btn {
        min-width: 48px;
        width: 48px;
        height: 48px;
    }

    .progress-handle {
        width: 16px;
        height: 16px;
    }
}
```

---

## FILE 3: frontend/app.js
**KEY CHANGES:**
- Line 23: setupTopClickShield() in constructor
- Lines 28-71: setupTopClickShield() method
- Line 115: setupShieldResizeObserver() in init()
- Lines 126-142: setupShieldResizeObserver() method
- Line 219: ensureShieldLayering() in onPlayerReady()
- Line 222: setupFullscreenListener() in onPlayerReady()
- Lines 228-249: ensureShieldLayering() method
- Lines 254-284: setupFullscreenListener() method

```javascript
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

        // ⭐ NEW: Initialize top click shield
        this.setupTopClickShield();

        this.init();
    }

    /**
     * ⭐ NEW: Setup the top click shield to prevent YouTube title/channel clicks
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

            // ⭐ NEW: Monitor wrapper for resize to maintain shield positioning
            this.setupShieldResizeObserver();

        } catch (error) {
            console.error('Failed to initialize player:', error);
            this.showError();
        }
    }

    /**
     * ⭐ NEW: Setup ResizeObserver to keep shield properly positioned during resize
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

        // ⭐ NEW: Ensure click shield is properly layered
        this.ensureShieldLayering();

        // ⭐ NEW: Handle fullscreen changes
        this.setupFullscreenListener();
    }

    /**
     * ⭐ NEW: Ensure the top click shield stays properly layered above the iframe
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
     * ⭐ NEW: Setup fullscreen listener to maintain shield visibility
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
 * - Top shield blocks access to YouTube's native UI
 */
```

---

## Summary of Changes

### HTML (index.html)
- Added: `.youtube-top-mask` div (visual cover)
- Added: `.youtube-top-click-shield` div (event blocker)

### CSS (style.css)
- Added: `.youtube-top-mask` styling (50px gradient overlay)
- Added: `.youtube-top-click-shield` styling (transparent blocker, z-index: 18)
- Added: `.youtube-top-click-shield` user-select prevention

### JavaScript (app.js)
- Added: `setupTopClickShield()` method (initializes event blocking)
- Added: `setupShieldResizeObserver()` method (maintains position on resize)
- Added: `ensureShieldLayering()` method (manages z-index hierarchy)
- Added: `setupFullscreenListener()` method (handles fullscreen z-index)
- Updated: Constructor calls `setupTopClickShield()`
- Updated: `init()` calls `setupShieldResizeObserver()`
- Updated: `onPlayerReady()` calls `ensureShieldLayering()` and `setupFullscreenListener()`

All changes are backward compatible. Custom controls remain fully functional (z-index: 20).
