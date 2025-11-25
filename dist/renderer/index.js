"use strict";
function openGame(game) {
    const url = game === "bonk"
        ? "https://bonk.io"
        : "https://www.haxball.com";
    window.location.href = url;
}
window.openGame = openGame;
