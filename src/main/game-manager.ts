/**
 * Gerenciador de Jogos
 * Centraliza informações e configurações dos jogos
 */

import { GameType, GameConfig } from '../types';

export class GameManager {
  private games: Map<GameType, GameConfig>;

  constructor() {
    this.games = new Map([
      [
        GameType.BONK,
        {
          name: 'Bonk.io',
          url: 'https://bonk.io',
          type: GameType.BONK,
        },
      ],
      [
        GameType.HAXBALL,
        {
          name: 'Haxball',
          url: 'https://www.haxball.com',
          type: GameType.HAXBALL,
        },
      ],
    ]);
  }

  public getGameConfig(gameType: GameType): GameConfig {
    const config = this.games.get(gameType);
    if (!config) {
      throw new Error(`Jogo não encontrado: ${gameType}`);
    }
    return config;
  }

  public getAllGames(): GameConfig[] {
    return Array.from(this.games.values());
  }
}
