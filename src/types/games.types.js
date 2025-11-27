"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = exports.GameUrls = exports.GameType = void 0;
var GameType;
(function (GameType) {
    GameType["BONKIO"] = "bonkio";
    GameType["HAXBALL"] = "haxball";
})(GameType || (exports.GameType = GameType = {}));
exports.GameUrls = {
    [GameType.BONKIO]: 'https://bonk.io/',
    [GameType.HAXBALL]: 'https://haxball.com/',
};
const createGame = (type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    url: exports.GameUrls[type],
});
exports.createGame = createGame;
//# sourceMappingURL=games.types.js.map