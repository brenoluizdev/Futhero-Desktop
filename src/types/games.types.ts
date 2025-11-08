export enum GameType {
  BONKIO = 'bonkio',
  HAXBALL = 'haxball',
}

export const GameUrls: Record<GameType, string> = {
  [GameType.BONKIO]: 'https://bonk.io',
  [GameType.HAXBALL]: 'https://haxball.com',
};

export interface Game {
  name: string;
  type: GameType;
  url: string;
}

export type Games = Game[];

export const createGame = (type: GameType): Game => ({
  name: type.charAt(0).toUpperCase() + type.slice(1),
  type,
  url: GameUrls[type],
});
