function openGame(game: "bonk" | "haxball") {
    const url =
        game === "bonk"
            ? "https://bonk.io"
            : "https://www.haxball.com";

    window.location.href = url;
}

(window as any).openGame = openGame;