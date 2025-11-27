(() => {
  console.log('[AntiCheat] Macro detector initializing...');

  const CONFIG = {
    enabled: true,
    maxViolationsBeforeBan: 5,
    minTimeBetweenInputs: 10,
    maxConsecutiveSameInterval: 5,
    intervalTolerance: 3,
    minHumanVariation: 15,
    maxInputsPerSecond: 50,
    analysisWindowSize: 20,
    suspiciousPatternThreshold: 3,
  };

  interface KeyPressData {
    key: string;
    timestamp: number;
    timeSinceLast: number;
  }

  const inputHistory: Map<string, KeyPressData[]> = new Map();
  const violationCount: Map<string, number> = new Map();
  let totalViolations = 0;

  function analyzeIntervals(intervals: number[]): {
    isSuspicious: boolean;
    reason: string;
    confidence: number;
  } {
    if (intervals.length < CONFIG.analysisWindowSize) {
      return { isSuspicious: false, reason: '', confidence: 0 };
    }

    const variance = calculateVariance(intervals);
    if (variance < CONFIG.minHumanVariation) {
      return {
        isSuspicious: true,
        reason: `Intervalos muito consistentes (variance: ${variance.toFixed(2)}ms)`,
        confidence: 0.9,
      };
    }

    const consecutiveSame = findConsecutiveSameIntervals(intervals);
    if (consecutiveSame >= CONFIG.maxConsecutiveSameInterval) {
      return {
        isSuspicious: true,
        reason: `${consecutiveSame} intervalos idênticos consecutivos`,
        confidence: 0.95,
      };
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const inputsPerSecond = 1000 / avgInterval;
    if (inputsPerSecond > CONFIG.maxInputsPerSecond) {
      return {
        isSuspicious: true,
        reason: `Flooding detectado (${inputsPerSecond.toFixed(1)} inputs/s)`,
        confidence: 0.85,
      };
    }

    const tooFastCount = intervals.filter(i => i < CONFIG.minTimeBetweenInputs).length;
    if (tooFastCount > intervals.length * 0.3) {
      return {
        isSuspicious: true,
        reason: `${tooFastCount} inputs humanamente impossíveis`,
        confidence: 0.8,
      };
    }

    if (hasAlternatingPattern(intervals)) {
      return {
        isSuspicious: true,
        reason: 'Padrão alternado detectado',
        confidence: 0.75,
      };
    }

    return { isSuspicious: false, reason: '', confidence: 0 };
  }

  function calculateVariance(intervals: number[]): number {
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const squaredDiffs = intervals.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.sqrt(variance);
  }

  function findConsecutiveSameIntervals(intervals: number[]): number {
    let maxConsecutive = 0;
    let currentConsecutive = 1;

    for (let i = 1; i < intervals.length; i++) {
      const diff = Math.abs(intervals[i] - intervals[i - 1]);
      if (diff <= CONFIG.intervalTolerance) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  function hasAlternatingPattern(intervals: number[]): boolean {
    if (intervals.length < 6) return false;

    let alternations = 0;
    for (let i = 2; i < intervals.length; i += 2) {
      const diff1 = Math.abs(intervals[i] - intervals[i - 2]);
      if (diff1 <= CONFIG.intervalTolerance) {
        alternations++;
      }
    }

    return alternations > intervals.length / 3;
  }

  function visualizeInputPattern(key: string, intervals: number[]) {
    if (intervals.length < 5) return;

    const last10 = intervals.slice(-10);
    const avg = last10.reduce((a, b) => a + b, 0) / last10.length;
    const variance = calculateVariance(last10);

    console.log(`[MacroDetector] Key: ${key}`);
    console.log(`  Últimos intervalos: [${last10.map(i => i.toFixed(1)).join(', ')}]ms`);
    console.log(`  Média: ${avg.toFixed(2)}ms | Desvio: ${variance.toFixed(2)}ms`);
  }

  function reportViolation(key: string, reason: string, confidence: number) {
    const currentViolations = (violationCount.get(key) || 0) + 1;
    violationCount.set(key, currentViolations);
    totalViolations++;

    console.warn(
      `[MacroDetector] 🚨 VIOLAÇÃO ${totalViolations}/${CONFIG.maxViolationsBeforeBan}`,
      `\n  Tecla: ${key}`,
      `\n  Razão: ${reason}`,
      `\n  Confiança: ${(confidence * 100).toFixed(0)}%`,
      `\n  Violações desta tecla: ${currentViolations}`
    );

    if ((window as any).futheroLauncherAPI) {
      (window as any).futheroLauncherAPI.log(
        `MACRO DETECTED - Key: ${key} - ${reason}`
      );
    }

    if (totalViolations >= CONFIG.maxViolationsBeforeBan) {
      triggerBan(key, reason);
    }
  }

  function triggerBan(key: string, reason: string) {
    console.error('[MacroDetector] 🔴 BAN TRIGGERED');

    document.body.style.pointerEvents = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: 'Poppins', Arial, sans-serif;
      color: white;
      text-align: center;
      animation: fadeIn 0.5s ease;
    `;

    const history = inputHistory.get(key) || [];
    const recentIntervals = history
      .slice(-10)
      .map(h => h.timeSinceLast.toFixed(1))
      .join(', ');

    overlay.innerHTML = `
      <div style="max-width: 700px; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        <div style="font-size: 100px; margin-bottom: 20px;">🚫</div>
        <h1 style="font-size: 3rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          MACRO DETECTED
        </h1>
        <p style="font-size: 1.4rem; margin-bottom: 15px; opacity: 0.95;">
          Uso de macro/AutoHotkey detectado
        </p>
        <div style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
          <p style="font-size: 1rem; margin: 5px 0;"><strong>Tecla:</strong> ${key}</p>
          <p style="font-size: 1rem; margin: 5px 0;"><strong>Razão:</strong> ${reason}</p>
          <p style="font-size: 0.9rem; margin: 10px 0; opacity: 0.7;">
            <strong>Intervalos detectados:</strong><br>
            [${recentIntervals}] ms
          </p>
        </div>
        <p style="font-size: 1.1rem; opacity: 0.8; margin-top: 20px;">
          Macros, AutoHotkey e scripts de automação são proibidos.
        </p>
        <p style="font-size: 1rem; opacity: 0.7; margin-top: 15px;">
          Reinicie o aplicativo para continuar.
        </p>
        <div style="margin-top: 30px; padding: 15px; background: rgba(255,0,0,0.2); border-radius: 10px;">
          <p style="font-size: 0.9rem; opacity: 0.6;">
            Total de violações: ${totalViolations}/${CONFIG.maxViolationsBeforeBan}
          </p>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const blockInput = (e: Event) => e.preventDefault();
    document.addEventListener('keydown', blockInput, true);
    document.addEventListener('keyup', blockInput, true);
    document.addEventListener('keypress', blockInput, true);
    document.addEventListener('mousedown', blockInput, true);
    document.addEventListener('mouseup', blockInput, true);
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!CONFIG.enabled) return;

    const key = e.key.toLowerCase();
    const timestamp = performance.now();

    if (!inputHistory.has(key)) {
      inputHistory.set(key, []);
    }

    const history = inputHistory.get(key)!;
    const timeSinceLast = history.length > 0 
      ? timestamp - history[history.length - 1].timestamp 
      : 0;

    history.push({ key, timestamp, timeSinceLast });

    if (history.length > CONFIG.analysisWindowSize * 2) {
      history.shift();
    }

    if (history.length >= CONFIG.analysisWindowSize) {
      const intervals = history
        .slice(-CONFIG.analysisWindowSize)
        .map(h => h.timeSinceLast)
        .filter(t => t > 0);

      const analysis = analyzeIntervals(intervals);

      if (analysis.isSuspicious && analysis.confidence > 0.7) {
        visualizeInputPattern(key, intervals);
        reportViolation(key, analysis.reason, analysis.confidence);
      }
    }
  }, true);

  let mouseClickHistory: number[] = [];
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (!CONFIG.enabled) return;

    const timestamp = performance.now();
    mouseClickHistory.push(timestamp);

    if (mouseClickHistory.length > CONFIG.analysisWindowSize * 2) {
      mouseClickHistory.shift();
    }

    if (mouseClickHistory.length >= CONFIG.analysisWindowSize) {
      const intervals = mouseClickHistory
        .slice(-CONFIG.analysisWindowSize)
        .map((t, i, arr) => i > 0 ? t - arr[i - 1] : 0)
        .filter(t => t > 0);

      const analysis = analyzeIntervals(intervals);

      if (analysis.isSuspicious && analysis.confidence > 0.7) {
        reportViolation('mouse', analysis.reason, analysis.confidence);
      }
    }
  }, true);

  setInterval(() => {
    const now = performance.now();
    const maxAge = 30000;

    inputHistory.forEach((history, key) => {
      const filtered = history.filter(h => now - h.timestamp < maxAge);
      if (filtered.length > 0) {
        inputHistory.set(key, filtered);
      } else {
        inputHistory.delete(key);
      }
    });

    mouseClickHistory = mouseClickHistory.filter(t => now - t < maxAge);
  }, 10000);

  console.log('[MacroDetector] ✓ Active and monitoring');
  console.log('[MacroDetector] Thresholds:', {
    maxInputsPerSecond: CONFIG.maxInputsPerSecond,
    minHumanVariation: CONFIG.minHumanVariation,
    maxConsecutiveSameInterval: CONFIG.maxConsecutiveSameInterval,
  });
})();