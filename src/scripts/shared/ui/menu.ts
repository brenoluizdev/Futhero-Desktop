(function() {
    console.log("[BonkMenu] Script iniciado");

    let menuInjected = false;
    let observerActive = false;

    function waitForBonkUI() {
        const iframe = document.getElementById("maingameframe") as HTMLIFrameElement;
        
        if (!iframe) {
            requestAnimationFrame(waitForBonkUI);
            return;
        }

        let iframeDoc: any;
        try {
            iframeDoc = iframe.contentWindow?.document;
            if (!iframeDoc) {
                requestAnimationFrame(waitForBonkUI);
                return;
            }
        } catch (e) {
            requestAnimationFrame(waitForBonkUI);
            return;
        }

        const topBar = iframeDoc.querySelector("#roomlisttopbar");
        const prettyTopBar = iframeDoc.querySelector("#pretty_top_bar");

        if (!topBar || !prettyTopBar) {
            requestAnimationFrame(waitForBonkUI);
            return;
        }

        console.log("[BonkMenu] UI do Bonk.io detectada");
        
        injectBonkMenu();
        
        setupMutationObserver(iframeDoc);
    }

    function injectBonkMenu() {
        const iframe = document.getElementById('maingameframe') as HTMLIFrameElement;
        if (!iframe?.contentWindow) {
            console.error("[BonkMenu] Iframe não encontrado");
            return;
        }

        const iframeDoc = iframe.contentWindow.document;
        const prettyTopBar = iframeDoc.querySelector('#pretty_top_bar');

        if (!prettyTopBar) {
            console.error("[BonkMenu] #pretty_top_bar não encontrado");
            return;
        }

        if (prettyTopBar.querySelector('#futhero_menu')) {
            console.log("[BonkMenu] Menu já existe, pulando injeção");
            return;
        }

        const menu = iframeDoc.createElement('div');
        menu.id = 'futhero_menu';
        menu.className = 'niceborderright';
        menu.textContent = 'FUTHERO';
        
        Object.assign(menu.style, {
            color: '#ffffff',
            fontFamily: 'futurept_b1',
            display: 'inline-block',
            paddingLeft: '10px',
            paddingRight: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none'
        });

        menu.addEventListener('mouseenter', () => {
            menu.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        menu.addEventListener('mouseleave', () => {
            menu.style.backgroundColor = '';
        });

        menu.addEventListener('click', () => {
            console.log("[BonkMenu] Menu clicado");
            openFutheroModal(iframeDoc);
        });

        prettyTopBar.appendChild(menu);
        
        menuInjected = true;
        console.log("[BonkMenu] ✅ Menu injetado com sucesso");
    }

    function openFutheroModal(iframeDoc: Document) {
        if (iframeDoc.querySelector('#futhero_modal')) {
            console.log("[BonkMenu] Modal já existe");
            return;
        }

        const modal = iframeDoc.createElement('div');
        modal.id = 'futhero_modal';
        modal.className = 'windowShadow';
        
        Object.assign(modal.style, {
            width: '346px',
            height: '430px',
            position: 'absolute',
            left: '0',
            right: '0',
            top: '0',
            bottom: '0',
            margin: 'auto',
            backgroundColor: '#e2e2e2',
            fontFamily: 'futurept_b1',
            borderRadius: '7px',
            zIndex: '10000',
            overflow: 'hidden'
        });

        const header = iframeDoc.createElement('div');
        Object.assign(header.style, {
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            padding: '15px 20px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '7px 7px 0 0',
            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
        });
        header.innerHTML = `
            <span>⚡ FUTHERO MENU</span>
        `;

        // Botão fechar
        const closeBtn = iframeDoc.createElement('button');
        closeBtn.textContent = '✕';
        Object.assign(closeBtn.style, {
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            fontFamily: 'futurept_b1',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            closeBtn.style.transform = 'rotate(90deg)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'rotate(0deg)';
        });
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        header.appendChild(closeBtn);

        const container = iframeDoc.createElement('div');
        Object.assign(container.style, {
            margin: '20px',
            padding: '25px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)',
            border: '2px solid rgba(255, 107, 53, 0.3)',
            position: 'relative',
            overflow: 'hidden'
        });

        const shine = iframeDoc.createElement('div');
        Object.assign(shine.style, {
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent, rgba(255, 107, 53, 0.2), transparent)',
            animation: 'shine 3s infinite',
            pointerEvents: 'none'
        });

        const style = iframeDoc.createElement('style');
        style.textContent = `
            @keyframes shine {
                0% { transform: translate(-100%, -100%) rotate(45deg); }
                100% { transform: translate(100%, 100%) rotate(45deg); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        iframeDoc.head.appendChild(style);

        container.appendChild(shine);

        const containerTitle = iframeDoc.createElement('div');
        containerTitle.textContent = '🎮 GAME CONTROLS';
        Object.assign(containerTitle.style, {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ff6b35',
            marginBottom: '20px',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
        });
        container.appendChild(containerTitle);

        const fullscreenBtn = iframeDoc.createElement('button');
        fullscreenBtn.innerHTML = '🖥️ FULLSCREEN MODE';
        Object.assign(fullscreenBtn.style, {
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            fontFamily: 'futurept_b1',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            fontWeight: 'bold'
        });

        fullscreenBtn.addEventListener('mouseenter', () => {
            fullscreenBtn.style.transform = 'translateY(-3px)';
            fullscreenBtn.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.6)';
            fullscreenBtn.style.animation = 'pulse 1s infinite';
        });

        fullscreenBtn.addEventListener('mouseleave', () => {
            fullscreenBtn.style.transform = 'translateY(0)';
            fullscreenBtn.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
            fullscreenBtn.style.animation = 'none';
        });

        fullscreenBtn.addEventListener('click', async () => {
            const iframe = document.getElementById('maingameframe') as HTMLIFrameElement;
            
            await (window as any).futheroLauncherAPI.fullscreenElement("#bonkiocontainer");

            if (iframe) {
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if ((iframe as any).webkitRequestFullscreen) {
                    (iframe as any).webkitRequestFullscreen();
                } else if ((iframe as any).mozRequestFullScreen) {
                    (iframe as any).mozRequestFullScreen();
                } else if ((iframe as any).msRequestFullscreen) {
                    (iframe as any).msRequestFullscreen();
                }
                console.log("[BonkMenu] Modo fullscreen ativado");
            }
        });

        container.appendChild(fullscreenBtn);

        const info = iframeDoc.createElement('div');
        info.textContent = '💡 Press ESC to exit fullscreen';
        Object.assign(info.style, {
            marginTop: '15px',
            fontSize: '12px',
            color: '#ff6b35',
            textAlign: 'center',
            fontStyle: 'italic',
            opacity: '0.8'
        });
        container.appendChild(info);

        modal.appendChild(header);
        modal.appendChild(container);

        iframeDoc.body.appendChild(modal);

        console.log("[BonkMenu] ✅ Modal criado com sucesso");
    }

    function setupMutationObserver(iframeDoc: Document) {
        if (observerActive) return;

        const observer = new MutationObserver((mutations) => {
            const prettyTopBar = iframeDoc.querySelector('#pretty_top_bar');
            const menuExists = prettyTopBar?.querySelector('#futhero_menu');

            if (prettyTopBar && !menuExists) {
                console.log("[BonkMenu] Menu removido, reinjetando...");
                menuInjected = false;
                injectBonkMenu();
            }
        });

        observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true
        });

        observerActive = true;
        console.log("[BonkMenu] MutationObserver ativo");
    }

    function monitorIframeNavigation() {
        const iframe = document.getElementById('maingameframe') as HTMLIFrameElement;
        if (!iframe) return;

        let lastUrl = '';
        setInterval(() => {
            try {
                const currentUrl = iframe.contentWindow?.location.href;
                if (currentUrl && currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    console.log("[BonkMenu] Navegação detectada:", currentUrl);
                    
                    menuInjected = false;
                    observerActive = false;
                    
                    setTimeout(() => waitForBonkUI(), 500);
                }
            } catch (e) {
                
            }
        }, 1000);
    }
    
    waitForBonkUI();
    monitorIframeNavigation();

    console.log("[BonkMenu] Inicialização completa");
})();