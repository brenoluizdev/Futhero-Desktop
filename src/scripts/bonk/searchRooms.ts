(function () {
    function waitForBonkUI() {
        const iframe: any = document.getElementById("maingameframe");
        if (!iframe) return requestAnimationFrame(waitForBonkUI);

        const bonk = iframe.contentWindow.document;
        const topBar = bonk.querySelector("#roomlisttopbar");

        if (!topBar) return requestAnimationFrame(waitForBonkUI);

        injectSearch(bonk);
    }

    function injectSearch(bonk: any) {
        const input = document.createElement("input");
        input.id = "roomSearchInputBox";
        input.placeholder = "Search Rooms..";
        input.style.cssText = `
            float: right;
            padding: 2px 8px;
            margin: 5px 20px;
            border: 2px solid #006157;
            border-radius: 5px;
            font: large futurept_b1;
        `;

        bonk.querySelector("#roomlisttopbar").appendChild(input);

        input.addEventListener("keyup", (ev: any) => {
            filterRooms(bonk, ev.target.value);
        });

        console.log("[Launcher] searchRooms.js carregado");
    }

    function filterRooms(bonk: Document, s: string) {
        s = s.toLowerCase();

        const rows = bonk.querySelectorAll("#roomlisttable tr");

        rows.forEach((row: any) => {
            const name = row.children[0]?.textContent?.toLowerCase() || "";
            row.hidden = !name.includes(s);
        });
    }

    waitForBonkUI();
})();