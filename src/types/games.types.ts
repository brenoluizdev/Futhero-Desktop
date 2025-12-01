export enum GameType {
  BONKIO = 'BONKIO',
  HAXBALL = 'HAXBALL',
}

export const GameUrls: Record<GameType, string> = {
  [GameType.BONKIO]: 'https://bonk.io/',
  [GameType.HAXBALL]: 'https://haxball.com/',
};

export interface Game {
  name: string;
  type: GameType;
  url: string;
}

export type Games = Game[];

export const createGame = (type: GameType): Game => ({
  name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
  type,
  url: GameUrls[type],
});

console.log("[GameTypes] GameUrls carregado:", GameUrls);
console.log("[GameTypes] BONKIO URL:", GameUrls[GameType.BONKIO]);
console.log("[GameTypes] HAXBALL URL:", GameUrls[GameType.HAXBALL]);