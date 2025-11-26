/**
 * Gerenciador de Configurações
 * Persiste configurações do launcher em arquivo JSON
 */

import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { LauncherConfig } from '../types';

export class ConfigManager {
  private configPath: string;
  private config: LauncherConfig;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): LauncherConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }

    // Configuração padrão
    return {
      currentGame: null,
      autoUpdate: true,
      theme: 'dark',
    };
  }

  private saveConfig(): void {
    try {
      const data = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(this.configPath, data, 'utf-8');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }

  public getConfig(): LauncherConfig {
    return { ...this.config };
  }

  public setConfig(updates: Partial<LauncherConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }
}
