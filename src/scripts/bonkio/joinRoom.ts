(function () {
    function waitForBonkUI() {
        const iframe: any = document.getElementById("maingameframe");
        if (!iframe) return requestAnimationFrame(waitForBonkUI);

        const bonk = iframe.contentWindow.document;
        const topBar = bonk.querySelector("#roomlisttopbar");

        if (!topBar) return requestAnimationFrame(waitForBonkUI);

        injectJoinButton(bonk);
    }

    function injectJoinButton(bonk: any) {
        const button = document.createElement("button");
        button.id = "joinRoomButton";
        button.textContent = "⇄";
        button.style.cssText = `
            float: right;
            width: 35px;
            height: 35px;
            margin: 5px 20px;
            border: 2px solid #006157;
            border-radius: 5px;
            background-color: #00a896;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            font-family: futurept_b1;
        `;

        bonk.querySelector("#roomlisttopbar").appendChild(button);

        button.addEventListener("click", () => {
            openJoinWindow();
        });

        console.log("[Launcher] joinRoom.js carregado");
    }

    function openJoinWindow() {
        (window as any).futheroLauncherAPI.openJoinWindow();
    }

    waitForBonkUI();
})();