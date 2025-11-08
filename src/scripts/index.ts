import fs from 'fs';
import path from 'path';

(function () {
  console.log('[Launcher] Injecting frontend modifications...');

  window.addEventListener('load', async () => {
    const functionsDir = path.join(__dirname, './frontend');
    const files = fs.readdirSync(functionsDir);

    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        try {
          const modulePath = path.join(functionsDir, file);
          const module = await import(modulePath);

          for (const exportName in module) {
            const exported = module[exportName];
            if (typeof exported === 'function') {
              console.log(`[Launcher] Running ${exportName}() from ${file}`);
              exported();
            }
          }
        } catch (err) {
          console.error(`[Launcher] Failed to load ${file}:`, err);
        }
      }
    }

    console.log('[Launcher] All frontend scripts loaded successfully.');
  });
})();
