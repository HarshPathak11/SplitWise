// Dev Tools Detection and Blocker
// Note: This is not 100% foolproof - determined users can still bypass it

class DevToolsBlocker {
  constructor() {
    this.isDevToolsOpen = false;
    this.threshold = 160; // Threshold for dev tools detection
    this.checkInterval = null;
    this.hasShownOverlay = false; // Prevent multiple overlays
    this.detectionCount = 0; // For debouncing
  }

  init() {
    // Only run in production
    if (import.meta.env.DEV) {
      console.log('Dev tools blocker disabled in development mode');
      return;
    }

    this.blockKeyboardShortcuts();
    this.blockRightClick();
    this.detectDevTools();
    this.blockDebugger();
  }

  // Block common keyboard shortcuts
  blockKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // F12 - Check both key and keyCode
      if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning();
        return false;
      }

      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.key === 'I')) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 74 || e.key === 'J')) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning();
        return false;
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 67 || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.keyCode === 85 || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning();
        return false;
      }

      // Ctrl+Shift+K (Firefox Console)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 75 || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning();
        return false;
      }
    }, true); // Add capture phase for better blocking
  }

  // Block right-click context menu
  blockRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showWarning();
      return false;
    }, true);
  }

  // Detect dev tools by monitoring window size changes
  detectDevTools() {
    const detectSize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > this.threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > this.threshold;

      if (widthThreshold || heightThreshold) {
        if (!this.isDevToolsOpen) {
          this.isDevToolsOpen = true;
          this.onDevToolsOpen();
        }
      } else {
        if (this.isDevToolsOpen) {
          this.isDevToolsOpen = false;
          // Reset detection count when dev tools are confirmed closed
          this.detectionCount = 0;
        }
      }
    };

    // Check on resize
    window.addEventListener('resize', detectSize);

    // Periodic check
    this.checkInterval = setInterval(detectSize, 1000);

    // Initial check
    detectSize();
  }

  // Debugger trap
  blockDebugger() {
    const debuggerLoop = () => {
      try {
        const start = performance.now();
        debugger; // This will pause if dev tools are open
        const end = performance.now();

        // If execution was paused (dev tools open), timing difference will be significant
        if (end - start > 100) {
          this.onDevToolsOpen();
        }
      } catch (e) {
        // Ignore errors
      }

      setTimeout(debuggerLoop, 1000);
    };

    // Start the loop
    setTimeout(debuggerLoop, 1000);
  }

  // Called when dev tools are detected
  onDevToolsOpen() {
    // Debounce: Only trigger after multiple detections to avoid false positives
    this.detectionCount++;
    
    if (this.detectionCount < 3) {
      return; // Wait for 3 consecutive detections
    }
    
    // Only show overlay once
    if (this.hasShownOverlay) {
      return;
    }
    
    this.hasShownOverlay = true;
    this.showBlockOverlay();

    // Option 2: Redirect to a warning page (uncomment if needed)
    // window.location.href = '/blocked';

    // Option 3: Clear the page content
    // document.body.innerHTML = '<h1>Access Denied</h1>';
  }

  // Show graceful warning notification
  showWarning() {
    // Check if notification already exists
    const existingNotification = document.getElementById('dev-tools-warning-toast');
    if (existingNotification) {
      // Trigger animation again
      existingNotification.style.animation = 'none';
      setTimeout(() => {
        existingNotification.style.animation = 'slideInRight 0.4s ease-out';
      }, 10);
      return;
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'dev-tools-warning-toast';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 400px;
      animation: slideInRight 0.4s ease-out;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    notification.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M12 8v4"></path>
        <path d="M12 16h.01"></path>
      </svg>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 2px;">Developer Tools Restricted</div>
        <div style="font-size: 12px; opacity: 0.9;">This feature is disabled for security purposes</div>
      </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    
    if (!document.getElementById('dev-tools-warning-styles')) {
      style.id = 'dev-tools-warning-styles';
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.4s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 3000);
  }

  // Show blocking overlay
  showBlockOverlay() {
    // Check if overlay already exists
    if (document.getElementById('dev-tools-block-overlay')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'dev-tools-block-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="text-align: center; color: white; max-width: 500px; padding: 40px;">
        <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
        <h1 style="font-size: 28px; margin-bottom: 10px;">Developer Tools Detected</h1>
        <p style="font-size: 16px; color: #999; margin-bottom: 30px;">
          Developer tools are disabled for security reasons to protect user data and application integrity.
        </p>
        <p style="font-size: 14px; color: #666;">
          Please close developer tools to continue using the application.
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    // NOTE: Overlay removal disabled to prevent flickering
    // Once shown, the overlay stays until page reload
    // This prevents the rapid show/hide cycle that causes flickering
  }

  // Cleanup method
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Create and export singleton instance
const devToolsBlocker = new DevToolsBlocker();

export default devToolsBlocker;
