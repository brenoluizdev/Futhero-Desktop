(function () {
    function waitForBonkUI() {
        const iframe = document.getElementById("maingameframe");
        if (!iframe) return requestAnimationFrame(waitForBonkUI);

        const bonk = iframe.contentWindow.document;
        const topBar = bonk.querySelector("#roomlisttopbar");

        if (!topBar) return requestAnimationFrame(waitForBonkUI);

        injectSearch(bonk);
    }

    function injectSearch(bonk) {
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

        input.addEventListener("keyup", ev => {
            filterRooms(bonk, ev.target.value);
        });

        console.log("[Launcher] searchRooms.js carregado");
    }

    function filterRooms(bonk, s) {
        s = s.toLowerCase();

        const rows = bonk.querySelectorAll("#roomlisttable tr");

        rows.forEach(row => {
            const name = row.children[0]?.textContent?.toLowerCase() || "";
            row.hidden = !name.includes(s);
        });
    }

    waitForBonkUI();
})();