# Dev Tools Blocker - Documentation

## ⚠️ Important Disclaimer

**This is NOT a foolproof security measure.** Determined users with technical knowledge can bypass ANY client-side security measure. The dev tools blocker is meant to:

- Deter casual users from accessing dev tools
- Protect against accidental exposure
- Add an extra layer of deterrence

**Do NOT rely on this for actual security!** Always implement proper backend security measures.

## 🛡️ What It Does

The dev tools blocker implements several detection and prevention mechanisms:

### 1. **Keyboard Shortcut Blocking**
Prevents common keyboard shortcuts from opening dev tools:
- `F12` - Dev tools
- `Ctrl + Shift + I` - Inspect
- `Ctrl + Shift + J` - Console
- `Ctrl + Shift + C` - Inspect Element
- `Ctrl + U` - View Source
- `Ctrl + Shift + K` - Firefox Console

### 2. **Right-Click Prevention**
Blocks the context menu to prevent "Inspect Element" option.

### 3. **Size-Based Detection**
Monitors window size changes to detect when dev tools are docked:
- Compares `window.outerWidth/Height` vs `window.innerWidth/Height`
- Triggers alert when threshold is exceeded

### 4. **Debugger Trap**
Uses `debugger;` statements that pause execution when dev tools are open:
- Measures execution time
- Detects significant delays (indicating paused debugger)

### 5. **Debouncing Logic**
Prevents false positives and flickering:
- Requires 3 consecutive detections before triggering
- Resets counter when dev tools are closed
- Prevents rapid show/hide cycles

### 6. **Warning Overlay**
When dev tools are detected:
- Shows a full-screen overlay
- Displays warning message
- Blocks interaction with the app
- **Persists until page reload** (prevents flickering)

## 📐 Implementation Details

The blocker uses a **simplified, reliable approach**:

**Active Methods:**
- ✅ Keyboard shortcut blocking (immediate prevention)
- ✅ Right-click blocking (immediate prevention)
- ✅ Window size detection (works on most browsers except Brave)
- ✅ Debugger trap (detects paused execution)
- ✅ Debouncing logic (prevents false positives)

**Removed Methods:**
- ❌ Console detection (caused flickering/false positives)
- ❌ ToString traps (unreliable, caused issues)

The current implementation prioritizes **prevention over detection** for maximum reliability.

## 🌐 Browser Compatibility

### **Brave Browser Special Considerations**

Brave browser has enhanced privacy features that make dev tools detection challenging:

**Known Issues:**
- ❌ Window size detection is unreliable (outerWidth === innerWidth due to anti-fingerprinting)
- ❌ Debugger statements can be ignored in settings
- ⚠️ **Console detection methods disabled** (caused flickering/false positives)

**What Works on Brave:**
- ✅ Keyboard shortcut blocking (F12, Ctrl+Shift+I, etc.)
- ✅ Right-click context menu blocking
- ✅ Enhanced event blocking with both `key` and `keyCode`
- ✅ Event capture phase blocking
- ⚠️ Window size detection (may not work due to privacy features)

### **Flickering Fix**

The blocker includes fixes to prevent overlay flickering:
- **Debouncing**: Requires 3 consecutive detections
- **One-time overlay**: Shows only once per session
- **No auto-removal**: Overlay persists until page reload
- **Counter reset**: Detection count resets when dev tools close

## 🚀 Usage

The blocker is automatically initialized in `main.jsx`:

```javascript
import devToolsBlocker from './utils/devToolsBlocker'

// Initialize (only runs in production)
devToolsBlocker.init();
```

### Development vs Production

- **Development mode**: Blocker is automatically **disabled**
- **Production mode**: Blocker is **active**

This is controlled by `import.meta.env.DEV`

## ⚙️ Configuration

You can customize the behavior in `devToolsBlocker.js`:

```javascript
constructor() {
  this.threshold = 160; // Size difference threshold for detection
  this.hasShownOverlay = false; // Prevent multiple overlays
  this.detectionCount = 0; // For debouncing (requires 3 detections)
}
```

### Options for When Dev Tools Are Detected

In the `onDevToolsOpen()` method, choose your preferred action:

```javascript
onDevToolsOpen() {
  // Debouncing logic - requires 3 detections
  this.detectionCount++;
  if (this.detectionCount < 3) return;
  
  // Prevent multiple overlays
  if (this.hasShownOverlay) return;
  this.hasShownOverlay = true;
  
  // Option 1: Show warning overlay (default)
  this.showBlockOverlay();
  
  // Option 2: Redirect to warning page
  // window.location.href = '/blocked';
  
  // Option 3: Clear page content
  // document.body.innerHTML = '<h1>Access Denied</h1>';
}
```

## 🚫 Limitations

### Can Be Bypassed By:
1. **Opening dev tools before page load**
2. **Using browser extensions** to modify behavior
3. **Disabling JavaScript** entirely
4. **Using remote debugging tools**
5. **Modifying the source code** directly
6. **Using browser dev tools in detached mode**

### Does NOT Protect:
- ❌ Source code (always visible to client)
- ❌ API endpoints (always accessible)
- ❌ Network requests (always visible)
- ❌ Local storage / cookies
- ❌ Authentication tokens in client

## ✅ Best Practices

### DO:
✅ Use this as one layer of defense-in-depth  
✅ Implement proper backend security  
✅ Validate all data on the server  
✅ Use HTTPS and secure authentication  
✅ Obfuscate/minify production code  
✅ Use rate limiting and CSRF protection  

### DON'T:
❌ Store sensitive data on client-side  
❌ Rely on this for actual security  
❌ Put API keys in frontend code  
❌ Trust client-side validation only  
❌ Assume this prevents all access  

## 🔧 Testing

To test the blocker:

1. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```
   
   Or from the frontend directory:
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Try opening dev tools:**
   - Press F12
   - Right-click and inspect
   - Use Ctrl+Shift+I

3. **Expected behavior:**
   - Keyboard shortcuts blocked immediately
   - Right-click disabled immediately
   - Warning overlay appears after 3 seconds if dev tools detected (via window size)
   
4. **Testing on Brave Browser:**
   - Keyboard shortcuts (F12, Ctrl+Shift+I) will be blocked
   - Right-click will be disabled
   - Window size detection may not work due to privacy features
   - Focus is on **prevention** rather than detection

## 🎯 When to Use

**Good Use Cases:**
- Protecting proprietary UI/UX from easy copying
- Deterring non-technical users
- Adding professionalism to the app
- Preventing accidental exposure

**Bad Use Cases:**
- Protecting sensitive data (do this server-side!)
- Preventing API access
- Hiding security vulnerabilities
- Storing secrets

## 📝 Notes

- All real security must happen on the backend
- This is cosmetic/deterrent only
- Minification + this = better deterrence
- Always test in production build
- Consider user experience impact

## 🔄 Cleanup

If you need to disable the blocker:

```javascript
// In main.jsx, comment out:
// devToolsBlocker.init();

// Or call destroy method:
devToolsBlocker.destroy();
```

---

**Remember**: Client-side security is an illusion. Always implement real security on your backend! 🔐
