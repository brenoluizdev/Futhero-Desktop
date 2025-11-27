(function() {
    function waitForBonkUI() {
        const iframe: any = document.getElementById("maingameframe");
        if (!iframe) return requestAnimationFrame(waitForBonkUI);

        const bonk = iframe.contentWindow.document;
        const topBar = bonk.querySelector("#roomlisttopbar");

        if (!topBar) return requestAnimationFrame(waitForBonkUI);

        createBonkMenu();
    }

    function createBonkMenu() {
        const iframe: any = document.getElementById('maingameframe');
        const iframeDoc = iframe.contentWindow.document;
        const prettyTopBar = iframeDoc.querySelector('#pretty_top_bar');

        if  (!prettyTopBar || prettyTopBar.querySelector('#futhero_menu')) return;

        const menu = document.createElement('div');
        menu.id = 'futhero_menu';
        menu.className = 'niceborderright';
        menu.style.color = "#ffffff";
        menu.style.fontFamily = "futurept_b1";
        menu.style.display = 'inline-block';
        menu.style.paddingLeft = '10px';
        menu.style.paddingRight = '15px';

        menu.addEventListener('click', () => {
            const menu = document.getElementById('futhero_menu');
            (window as any).futheroLauncherAPI.sendNotification("menu clicado");
        });
    }

    waitForBonkUI();
})