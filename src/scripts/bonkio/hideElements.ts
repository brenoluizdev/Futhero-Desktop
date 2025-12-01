(() => {
    const HIDER_VERSION = '2.0';
    console.log(`[Hider v${HIDER_VERSION}] Script iniciado.`);

    function observeAndRemove(
        targetDocument: Document,
        selectors: string[],
        contextName: string
    ): void {
        if (!targetDocument) {
            console.error(`[Hider] Documento inválido para o contexto '${contextName}'.`);
            return;
        }

        const cleanup = (): void => {
            let wasRemoved = false;
            selectors.forEach(selector => {
                targetDocument.querySelectorAll(selector).forEach(element => {
                    element.remove();
                    wasRemoved = true;
                    console.log(`[Hider] Elemento '${selector}' removido do contexto '${contextName}'.`);
                });
            });
        };

        cleanup();

        const observer = new MutationObserver(cleanup);

        const startObserver = () => {
            if (targetDocument.body) {
                observer.observe(targetDocument.body, {
                    childList: true,
                    subtree: true
                });
                console.log(`[Hider] Observador para o contexto '${contextName}' está ATIVO.`);
            } else {
                console.warn(`[Hider] 'body' não encontrado no contexto '${contextName}'. Tentando novamente em 100ms.`);
                setTimeout(startObserver, 100);
            }
        };
        
        startObserver();
    }

    const mainDocumentSelectors: string[] = [
        '#adboxverticalCurse',
        '#adboxverticalleftCurse',
        '#descriptioncontainer',
        '#cookieBanner',
        '#promoPopup',
        '#bonkioheader',
        '#bonk_d_2'
    ];

    const bonkIframeSelectors: string[] = [];

    observeAndRemove(document, mainDocumentSelectors, 'Principal');

    const waitForIframe = (iframeSelector: string, iframeSelectors: string[]) => {
        const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement | null;

        if (iframe && iframe.contentWindow) {
            observeAndRemove(iframe.contentWindow.document, iframeSelectors, `Iframe (${iframeSelector})`);
        } else {
            requestAnimationFrame(() => waitForIframe(iframeSelector, iframeSelectors));
        }
    };

    waitForIframe('#maingameframe', bonkIframeSelectors);
})();
