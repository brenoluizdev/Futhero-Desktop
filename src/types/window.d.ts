interface Window {
  fh: {
    injectFile: (filePath: string) => void;
    applyPerformanceSettings: () => Promise<void>;
  };
}