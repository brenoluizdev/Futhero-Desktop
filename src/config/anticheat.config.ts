// src/config/anticheat.config.ts
// Arquivo de configuração centralizado do AntiCheat

export const ANTICHEAT_CONFIG = {
  // ===== CONFIGURAÇÕES PRINCIPAIS =====
  enableMemoryProtection: true,
  enableSpeedHackDetection: true,
  enablePacketValidation: true,
  enableDebuggerDetection: false, // ⚠️ Desabilitado para evitar falsos positivos
  monitoringInterval: 1000,
  maxViolationsBeforeBan: 10, // ⚠️ Aumentado para evitar bans indevidos
  reportToServer: false,

  // ===== WHITELIST DE DOMÍNIOS AUTORIZADOS =====
  authorizedDomains: [
    // Jogos
    'bonk.io',
    'haxball.com',
    'www.haxball.com',
    'html5.haxball.com',
    
    // CDNs e Serviços
    'cdnjs.cloudflare.com',
    'unpkg.com',
    'jsdelivr.net',
    'cloudflare.com',
    
    // Google Services
    'googleapis.com',
    'gstatic.com',
    'google.com',
    'googletagmanager.com',
    'google-analytics.com',
    'doubleclick.net',
    
    // Bibliotecas comuns
    'jquery.com',
    'bootstrapcdn.com',
    
    // Protocolos locais
    'app://',
    'file://',
    'about:',
    'chrome-extension://',
    'moz-extension://',
    
    // ⬇️ ADICIONE SEUS DOMÍNIOS AUTORIZADOS AQUI ⬇️
    // 'exemplo.com',
  ],

  // ===== PADRÕES SUSPEITOS (RegExp) =====
  suspiciousPatterns: [
    /speedhack/gi,
    /aimbot/gi,
    /wallhack/gi,
    /noclip/gi,
    /godmode/gi,
    /\bhack\s*=/gi,      // "hack = ..."
    /\bcheat\s*=/gi,     // "cheat = ..."
    /inject.*exploit/gi,
    /bypass.*protection/gi,
  ],

  // ===== PALAVRAS EM CONTEXTO SEGURO =====
  // Palavras que podem conter partes de palavras suspeitas mas são legítimas
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

  // ===== THRESHOLDS DE DETECÇÃO =====
  thresholds: {
    debuggerDelay: 200,              // ms - tempo de delay para considerar debugger
    speedHackFrameThreshold: 200,    // frames - quantos frames antes de considerar suspeito
    speedHackDeltaThreshold: 5,      // ms - delta de tempo suspeito
    requiredSuspiciousDetections: 10, // quantas detecções suspeitas antes de reportar
    consecutiveDebuggerDetections: 3, // quantas detecções consecutivas de debugger
  },

  // ===== INTERVALOS DE VERIFICAÇÃO =====
  intervals: {
    debuggerCheck: 10000,    // ms - verificar debugger a cada 10 segundos
    scriptCheck: 5000,       // ms - aguardar 5 segundos antes de primeira verificação
    integrityCheck: 1000,    // ms - verificação geral de integridade
  },

  // ===== MODO DESENVOLVIMENTO =====
  development: {
    enableLogging: true,           // Logs detalhados
    disableDebuggerDetection: true, // Nunca detectar debugger em dev
    disableBan: false,              // Permitir ban mesmo em dev
    increaseThresholds: true,       // Thresholds mais permissivos
  },
};

// Função para obter config adaptada ao ambiente
export function getAntiCheatConfig(isDevelopment: boolean = false) {
  const config = { ...ANTICHEAT_CONFIG };

  if (isDevelopment && config.development.increaseThresholds) {
    config.maxViolationsBeforeBan = 999; // Praticamente impossível de banir em dev
    config.enableDebuggerDetection = false;
    config.thresholds.requiredSuspiciousDetections = 50;
  }

  return config;
}

// Função para adicionar domínio à whitelist em runtime
export function addAuthorizedDomain(domain: string) {
  if (!ANTICHEAT_CONFIG.authorizedDomains.includes(domain)) {
    ANTICHEAT_CONFIG.authorizedDomains.push(domain);
    console.log(`[AntiCheat Config] Added authorized domain: ${domain}`);
  }
}

// Função para remover domínio da whitelist
export function removeAuthorizedDomain(domain: string) {
  const index = ANTICHEAT_CONFIG.authorizedDomains.indexOf(domain);
  if (index > -1) {
    ANTICHEAT_CONFIG.authorizedDomains.splice(index, 1);
    console.log(`[AntiCheat Config] Removed authorized domain: ${domain}`);
  }
}

// Função para verificar se domínio é autorizado
export function isAuthorizedDomain(url: string): boolean {
  return ANTICHEAT_CONFIG.authorizedDomains.some(domain => url.includes(domain));
}