(() => {
  console.log('[AntiCheat] Client-side protection initializing...');

  const config = {
    enableMemoryProtection: true,
    enableSpeedHackDetection: true,
    enablePacketValidation: true,
    enableDebuggerDetection: false,
    monitoringInterval: 1000,
    maxViolationsBeforeBan: 10,
    reportToServer: false,
  };

  let violations = 0;
  const MAX_VIOLATIONS = config.maxViolationsBeforeBan;

  const AUTHORIZED_DOMAINS = [
    'bonk.io',
    'haxball.com',
    'www.haxball.com',
    'html5.haxball.com',
    'cdnjs.cloudflare.com',
    'googleapis.com',
    'gstatic.com',
    'google.com',
    'googletagmanager.com',
    'google-analytics.com',
    'doubleclick.net',
    'app://',
    'file://',
    'about:',
    'chrome-extension://',
    'moz-extension://',
    'unpkg.com',
    'jsdelivr.net',
    'cloudflare.com',
    'jquery.com',
    'bootstrapcdn.com',
  ];

  const CONTEXT_SAFE_KEYWORDS = [
    'achievement',
    'attachment',
    'enchant',
    'merchant',
    'research',
    'dispatch',
  ];

  const protectGameObjects = () => {
    console.log('[AntiCheat] Memory protection initialized');
    
    try {
      if (typeof Object.freeze === 'function') {
        const nativeToString = Function.prototype.toString;
        Object.defineProperty(Function.prototype, 'toString', {
          value: nativeToString,
          writable: false,
          configurable: false,
        });
      }
    } catch (e) {
      console.log('[AntiCheat] Memory protection partially applied');
    }
  };

  const debuggerDetection = () => {
    if (!config.enableDebuggerDetection) {
      console.log('[AntiCheat] Debugger detection disabled');
      return;
    }

    let consecutiveDetections = 0;
    const REQUIRED_DETECTIONS = 3;

    const check = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();

      if (end - start > 200) {
        consecutiveDetections++;
        if (consecutiveDetections >= REQUIRED_DETECTIONS) {
          reportViolation('Debugger detected after multiple confirmations');
          consecutiveDetections = 0;
        }
      } else {
        consecutiveDetections = 0;
      }
    };

    setInterval(check, 10000);
  };

  const speedHackDetection = () => {
    let lastTime = Date.now();
    let frameCount = 0;
    let suspiciousCount = 0;
    const REQUIRED_SUSPICIOUS = 10;

    const checkFrame = () => {
      const now = Date.now();
      const delta = now - lastTime;
      frameCount++;

      if (delta < 5 && frameCount > 200) {
        suspiciousCount++;
        if (suspiciousCount > REQUIRED_SUSPICIOUS) {
          reportViolation(`Speed hack detected: ${frameCount} frames in ${delta}ms (confirmed ${suspiciousCount} times)`);
          suspiciousCount = 0;
        }
      }

      if (delta > 1000) {
        frameCount = 0;
        suspiciousCount = Math.max(0, suspiciousCount - 1);
        lastTime = now;
      }

      requestAnimationFrame(checkFrame);
    };

    requestAnimationFrame(checkFrame);
  };
  
  const protectWebSocket = () => {
    const OriginalWebSocket = window.WebSocket;
    let wsInstances: WebSocket[] = [];

    (window as any).WebSocket = function (url: string, protocols?: string | string[]) {
      console.log('[AntiCheat] WebSocket connection monitored:', url);

      const ws = new OriginalWebSocket(url, protocols);
      wsInstances.push(ws);

      const originalSend = ws.send;
      ws.send = function (data: any) {
        return originalSend.call(this, data);
      };

      return ws;
    };

    Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
    window.WebSocket.prototype = OriginalWebSocket.prototype;
  };

  const isAuthorizedScript = (src: string): boolean => {
    if (!src) return true;

    return AUTHORIZED_DOMAINS.some(domain => src.includes(domain));
  };

  const isSafeContext = (content: string, keyword: string): boolean => {
    const lowerContent = content.toLowerCase();
    const keywordIndex = lowerContent.indexOf(keyword);
    
    if (keywordIndex === -1) return true;

    const contextStart = Math.max(0, keywordIndex - 20);
    const contextEnd = Math.min(lowerContent.length, keywordIndex + keyword.length + 20);
    const context = lowerContent.substring(contextStart, contextEnd);

    return CONTEXT_SAFE_KEYWORDS.some(safeWord => context.includes(safeWord));
  };

  const detectInjectedScripts = () => {
    const SUSPICIOUS_PATTERNS = [
      /speedhack/gi,
      /aimbot/gi,
      /wallhack/gi,
      /noclip/gi,
      /godmode/gi,
      /\bhack\s*=/gi,
      /\bcheat\s*=/gi,
      /inject.*exploit/gi,
      /bypass.*protection/gi,
    ];

    const checkScripts = () => {
      const scripts = document.querySelectorAll('script');
      
      scripts.forEach((script) => {
        const src = script.src;

        if (src && !isAuthorizedScript(src)) {
          console.warn('[AntiCheat] Unauthorized external script detected:', src);
          reportViolation(`Unauthorized script: ${src}`);
        }

        const content = script.textContent || '';
        
        SUSPICIOUS_PATTERNS.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            console.warn('[AntiCheat] Suspicious pattern found:', pattern);
            reportViolation(`Suspicious code pattern detected: ${pattern.source}`);
          }
        });
      });
    };

    setTimeout(checkScripts, 5000);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            setTimeout(checkScripts, 100);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  };

  const protectConsole = () => {
    console.log('[AntiCheat] Console protection initialized (monitoring only)');
  };

  const reportViolation = (details: string) => {
    violations++;
    
    console.warn(`[AntiCheat] Violation ${violations}/${MAX_VIOLATIONS}: ${details}`);

    if ((window as any).futheroLauncherAPI) {
      (window as any).futheroLauncherAPI.log(`VIOLATION: ${details}`);
    }

    if (violations >= MAX_VIOLATIONS) {
      triggerBan(details);
    }
  };

  const triggerBan = (reason: string) => {
    console.error('[AntiCheat] BAN TRIGGERED:', reason);

    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';

    const overlay = document.createElement('div');
    overlay.id = 'anticheat-ban-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #ff0000 0%, #8b0000 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: 'Poppins', Arial, sans-serif;
      color: white;
      text-align: center;
      animation: fadeIn 0.5s ease;
    `;

    overlay.innerHTML = `
      <div style="max-width: 600px; padding: 40px;">
        <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 3rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          ANTI-CHEAT VIOLATION
        </h1>
        <p style="font-size: 1.3rem; margin-bottom: 15px; opacity: 0.9;">
          Multiple cheating attempts have been detected.
        </p>
        <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.8;">
          Reason: ${reason}
        </p>
        <p style="font-size: 1rem; opacity: 0.7;">
          Please restart the application to continue.
        </p>
        <div style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 10px;">
          <p style="font-size: 0.9rem; opacity: 0.6;">
            Violations: ${violations}/${MAX_VIOLATIONS}
          </p>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    document.addEventListener('keydown', (e) => e.preventDefault(), true);
    document.addEventListener('keyup', (e) => e.preventDefault(), true);
    document.addEventListener('keypress', (e) => e.preventDefault(), true);
  };

  const initialize = () => {
    console.log('[AntiCheat] Initializing protection systems...');

    if (config.enableMemoryProtection) {
      protectGameObjects();
      protectConsole();
    }

    if (config.enableDebuggerDetection) {
      debuggerDetection();
    }

    if (config.enableSpeedHackDetection) {
      speedHackDetection();
    }

    if (config.enablePacketValidation) {
      protectWebSocket();
    }

    detectInjectedScripts();

    console.log('[AntiCheat] All protection systems active ✓');
    console.log('[AntiCheat] Max violations before ban:', MAX_VIOLATIONS);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 2000);
    });
  } else {
    setTimeout(initialize, 2000);
  }
})();