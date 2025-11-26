export enum ViolationType {
  MEMORY_MANIPULATION = 'memory_manipulation',
  SPEED_HACK = 'speed_hack',
  WALLHACK = 'wallhack',
  AIMBOT = 'aimbot',
  PACKET_MANIPULATION = 'packet_manipulation',
  SCRIPT_INJECTION = 'script_injection',
  DEBUGGER_DETECTED = 'debugger_detected',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

export interface ViolationReport {
  type: ViolationType;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  gameType: string;
  userId?: string;
}

export interface AntiCheatConfig {
  enableMemoryProtection: boolean;
  enableSpeedHackDetection: boolean;
  enablePacketValidation: boolean;
  enableDebuggerDetection: boolean;
  monitoringInterval: number;
  maxViolationsBeforeBan: number;
  reportToServer: boolean;
}

export interface GameState {
  lastUpdate: number;
  position?: { x: number; y: number };
  velocity?: { x: number; y: number };
  health?: number;
  score?: number;
}

export interface IntegrityCheck {
  checksum: string;
  timestamp: number;
  valid: boolean;
}