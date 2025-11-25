export const ANTICHEAT_CONFIG = {
  enableMemoryProtection: true,
  enableSpeedHackDetection: true,
  enablePacketValidation: true,
  enableDebuggerDetection: false,
  monitoringInterval: 1000,
  maxViolationsBeforeBan: 10,
  reportToServer: false,

  authorizedDomains: [
    'bonk.io',
    'haxball.com',
    'www.haxball.com',
    'html5.haxball.com',
    'cdnjs.cloudflare.com',
    'unpkg.com',
    'jsdelivr.net',
    'cloudflare.com',
    'googleapis.com',
    'gstatic.com',
    'google.com',
    'googletagmanager.com',
    'google-analytics.com',
    'doubleclick.net',
    'jquery.com',
    'bootstrapcdn.com',
    'app://',
    'file://',
    'about:',
    'chrome-extension://',
    'moz-extension://',
  ],

  suspiciousPatterns: [
    /speedhack/gi,
    /aimbot/gi,
    /wallhack/gi,
    /noclip/gi,
    /godmode/gi,
    /\bhack\s*=/gi,
    /\bcheat\s*=/gi,
    /inject.*exploit/gi,
    /bypass.*protection/gi,
  ],

  contextSafeKeywords: [
    'achievement',
    'attachment',
    'enchant',
    'merchant',
    'research',
    'dispatch',
    'character',
    'matchmaking',
  ],

  thresholds: {
    debuggerDelay: 200,
    speedHackFrameThreshold: 200,
    speedHackDeltaThreshold: 5,
    requiredSuspiciousDetections: 10,
    consecutiveDebuggerDetections: 3
  },

  intervals: {
    debuggerCheck: 10000,
    scriptCheck: 5000,
    integrityCheck: 1000,
  },

  development: {
    enableLogging: true,
    disableDebuggerDetection: true,
    disableBan: false,
    increaseThresholds: true,
  },
};

export function getAntiCheatConfig(isDevelopment: boolean = false) {
  const config = { ...ANTICHEAT_CONFIG };

  if (isDevelopment && config.development.increaseThresholds) {
    config.maxViolationsBeforeBan = 999;
    config.enableDebuggerDetection = false;
    config.thresholds.requiredSuspiciousDetections = 50;
  }

  return config;
}

export function addAuthorizedDomain(domain: string) {
  if (!ANTICHEAT_CONFIG.authorizedDomains.includes(domain)) {
    ANTICHEAT_CONFIG.authorizedDomains.push(domain);
    console.log(`[AntiCheat Config] Added authorized domain: ${domain}`);
  }
}

export function removeAuthorizedDomain(domain: string) {
  const index = ANTICHEAT_CONFIG.authorizedDomains.indexOf(domain);
  if (index > -1) {
    ANTICHEAT_CONFIG.authorizedDomains.splice(index, 1);
    console.log(`[AntiCheat Config] Removed authorized domain: ${domain}`);
  }
}

export function isAuthorizedDomain(url: string): boolean {
  return ANTICHEAT_CONFIG.authorizedDomains.some(domain => url.includes(domain));
}