const { spawn } = require('child_process');

let electronProcess = null;
let buildComplete = { main: false, preload: false };

function startElectron() {
  if (electronProcess) {
    electronProcess.kill();
  }

  console.log('\n🚀 Starting Electron...\n');

  electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
    shell: true, // importante no Windows
  });

  electronProcess.on('close', (code) => {
    if (code !== null) {
      process.exit(code);
    }
  });
}

function checkAndStart() {
  if (buildComplete.main && buildComplete.preload) {
    startElectron();
  }
}

// Compile Main Process
const mainCompiler = spawn('npx', ['tsc', '-p', 'tsconfig.main.json', '-w'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
});

mainCompiler.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  if (output.includes('Watching for file changes')) {
    if (!buildComplete.main) {
      buildComplete.main = true;
      console.log('✅ Main process compiled');
      checkAndStart();
    } else {
      console.log('🔄 Main process recompiled - restarting Electron...');
      startElectron();
    }
  }
});

// Compile Preload Scripts
const preloadCompiler = spawn('npx', ['tsc', '-p', 'tsconfig.preload.json', '-w'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
});

preloadCompiler.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  if (output.includes('Watching for file changes')) {
    if (!buildComplete.preload) {
      buildComplete.preload = true;
      console.log('✅ Preload scripts compiled');
      checkAndStart();
    } else {
      console.log('🔄 Preload scripts recompiled - restarting Electron...');
      startElectron();
    }
  }
});

// Start Webpack Dev Server
const webpackServer = spawn('npx', ['webpack', 'serve', '--config', 'webpack.renderer.config.js'], {
  stdio: 'inherit',
  shell: true,
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...\n');
  mainCompiler.kill();
  preloadCompiler.kill();
  webpackServer.kill();
  if (electronProcess) electronProcess.kill();
  process.exit(0);
});
