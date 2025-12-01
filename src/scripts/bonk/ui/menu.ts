(function () {
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
        const prettyTopBar = iframeDoc.getElementById('pretty_top_bar');

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
            openFutheroModal();
        });

        prettyTopBar.appendChild(menu);

        menuInjected = true;
        console.log("[BonkMenu] ✅ Menu injetado com sucesso");
    }

    function openFutheroModal() {
        const iframe = document.getElementById("maingameframe") as HTMLIFrameElement;
        const iframeDoc = iframe.contentWindow?.document;
        const bonkContainer = iframeDoc?.getElementById('bonkiocontainer');

        if (!bonkContainer) {
            console.error("[BonkMenu] #bonkiocontainer não encontrado");
            return;
        }

        if (document.querySelector('#futhero_modal_overlay')) {
            console.log("[BonkMenu] Modal já existe");
            return;
        }

        if (!document.getElementById('futhero_modal_styles')) {
            const style = document.createElement('style');
            style.id = 'futhero_modal_styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes shine {
                    0% { transform: translateX(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) rotate(45deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }

        const overlay = document.createElement('div');
        overlay.id = 'futhero_modal_overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        const modal = document.createElement('div');
        modal.id = 'futhero_modal';
        modal.className = 'windowShadow';

        Object.assign(modal.style, {
            width: '90%',
            height: '85%',
            maxWidth: '1400px',
            maxHeight: '900px',
            backgroundColor: '#0f1419',
            fontFamily: 'futurept_b1',
            borderRadius: '20px',
            zIndex: '10000',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 103, 0, 0.3)',
            border: '1px solid rgba(255, 103, 0, 0.15)',
            animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            flexDirection: 'column'
        });

        const header = createHeader(() => overlay.remove());
        const mainContainer = createMainContainer();
        const footer = createFooter();

        modal.appendChild(header);
        modal.appendChild(mainContainer);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        bonkContainer.appendChild(overlay);

        console.log("[BonkMenu] ✅ Modal criado no #bonkiocontainer");
    }

    function createHeader(onClose: () => void) {
        const header = document.createElement('div');
        Object.assign(header.style, {
            background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)',
            padding: '25px 35px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid rgba(255, 103, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden'
        });

        const headerShine = document.createElement('div');
        Object.assign(headerShine.style, {
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 103, 0, 0.1), transparent)',
            animation: 'shine 4s infinite',
            pointerEvents: 'none'
        });
        header.appendChild(headerShine);

        const headerTitle = document.createElement('div');
        headerTitle.style.position = 'relative';
        headerTitle.innerHTML = `
            <span style="color: #ff6700; text-shadow: 0 0 20px rgba(255, 103, 0, 0.5);">⚡</span>
            <span style="margin-left: 10px;">FUTHERO</span>
            <span style="color: #888; font-size: 14px; margin-left: 15px; font-weight: normal;">Enhanced Menu</span>
        `;
        header.appendChild(headerTitle);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        Object.assign(closeBtn.style, {
            background: 'rgba(255, 103, 0, 0.1)',
            border: '1px solid rgba(255, 103, 0, 0.3)',
            color: '#ff6700',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '20px',
            fontFamily: 'futurept_b1',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        });
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 103, 0, 0.2)';
            closeBtn.style.transform = 'rotate(90deg) scale(1.1)';
            closeBtn.style.boxShadow = '0 0 20px rgba(255, 103, 0, 0.5)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 103, 0, 0.1)';
            closeBtn.style.transform = 'rotate(0deg) scale(1)';
            closeBtn.style.boxShadow = 'none';
        });
        closeBtn.addEventListener('click', onClose);
        header.appendChild(closeBtn);

        return header;
    }

    function createMainContainer() {
        const mainContainer = document.createElement('div');
        Object.assign(mainContainer.style, {
            flex: '1',
            padding: '40px',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, #0f1419 0%, #1a1f2e 100%)'
        });

        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
        });

        const gameSection = createSection('🎮', 'GAME CONTROLS', 'Control your gaming experience');
        const fullscreenBtn = createButton('🖥️ FULLSCREEN MODE', 'Enter immersive fullscreen mode');
        fullscreenBtn.addEventListener('click', async () => {
            document.getElementById('futhero_modal_overlay')?.remove();
            const iframe = document.getElementById('maingameframe') as HTMLIFrameElement;
            await (window as any).futheroLauncherAPI.fullscreenElement("#bonkiocontainer");
            if (iframe?.requestFullscreen) iframe.requestFullscreen();
        });
        gameSection.appendChild(fullscreenBtn);

        const quickTip = document.createElement('div');
        quickTip.innerHTML = '💡 <span style="color: #888;">Quick Tip:</span> Press <span style="color: #ff6700; font-weight: bold;">ESC</span> to exit fullscreen';
        Object.assign(quickTip.style, {
            marginTop: '15px',
            fontSize: '13px',
            color: '#aaa',
            padding: '12px',
            background: 'rgba(255, 103, 0, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 103, 0, 0.1)'
        });
        gameSection.appendChild(quickTip);
        grid.appendChild(gameSection);

        const perfSection = createPerformanceSection();
        grid.appendChild(perfSection);

        mainContainer.appendChild(grid);
        return mainContainer;
    }

    // Adicione esta função no createPerformanceSection()

    // Adicione esta função no createPerformanceSection()

    function createPerformanceSection() {
        const section = createSection('⚡', 'PERFORMANCE', 'Optimize your game performance');

        // Toggle FPS Ilimitado
        const unlockFPSContainer = createToggleOption(
            '🚀 Unlock FPS',
            'Remove all FPS limitations',
            async () => {
                const futheroLauncherAPI = (window as any).futheroLauncherAPI;
                if (futheroLauncherAPI) {
                    const isUnlocked = await futheroLauncherAPI.toggleUnlimitedFPS();
                    return isUnlocked;
                }
                return false;
            },
            async () => {
                const futheroLauncherAPI = (window as any).futheroLauncherAPI;
                return await futheroLauncherAPI?.isUnlockedFps() || false;
            }
        );
        section.appendChild(unlockFPSContainer);

        // Seletor de FPS Limitado
        const fpsLimitContainer = createFpsLimitSelector();
        section.appendChild(fpsLimitContainer);

        // Show FPS Counter
        const showFPSContainer = createToggleOption(
            '📊 Show FPS Counter',
            'Display real-time FPS on screen',
            async () => {
                const fpsDisplay = document.getElementById('futhero-fps-display');
                if (fpsDisplay) {
                    const isVisible = fpsDisplay.style.display !== 'none';
                    fpsDisplay.style.display = isVisible ? 'none' : 'block';
                    return !isVisible;
                }
                return false;
            },
            async () => {
                const fpsDisplay = document.getElementById('futhero-fps-display');
                return fpsDisplay?.style.display !== 'none';
            }
        );
        section.appendChild(showFPSContainer);

        const infoBox = document.createElement('div');
        infoBox.innerHTML = `
        <div style="display: flex; align-items: start; gap: 10px;">
            <div style="font-size: 20px;">ℹ️</div>
            <div>
                <div style="color: #fff; font-weight: bold; margin-bottom: 5px;">Performance Tips</div>
                <div style="color: #888; font-size: 12px; line-height: 1.5;">
                    • Unlock FPS for maximum smoothness<br>
                    • Set custom FPS limit to balance performance<br>
                    • Monitor FPS to check performance<br>
                    • Close other apps for better results
                </div>
            </div>
        </div>
    `;
        Object.assign(infoBox.style, {
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 103, 0, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 103, 0, 0.1)',
            fontSize: '13px'
        });
        section.appendChild(infoBox);

        return section;
    }

    // Adicione esta nova função
    function createFpsLimitSelector() {
        const container = document.createElement('div');

        Object.assign(container.style, {
            padding: '20px',
            background: 'rgba(255, 103, 0, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 103, 0, 0.1)',
            marginBottom: '15px',
            transition: 'all 0.3s ease'
        });

        container.addEventListener('mouseenter', () => {
            container.style.background = 'rgba(255, 103, 0, 0.08)';
            container.style.borderColor = 'rgba(255, 103, 0, 0.2)';
        });

        container.addEventListener('mouseleave', () => {
            container.style.background = 'rgba(255, 103, 0, 0.05)';
            container.style.borderColor = 'rgba(255, 103, 0, 0.1)';
        });

        const header = document.createElement('div');
        header.innerHTML = `
        <div style="color: #fff; font-weight: bold; margin-bottom: 4px;">🎯 Custom FPS Limit</div>
        <div style="color: #888; font-size: 12px; margin-bottom: 15px;">Set a specific FPS cap (Default: Native - No limiter)</div>
    `;
        container.appendChild(header);

        // Botão Reset to Default
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '🔄 Reset to Default (Native)';
        Object.assign(resetBtn.style, {
            width: '100%',
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#60a5fa',
            fontSize: '14px',
            fontFamily: 'futurept_b1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 'bold',
            marginBottom: '15px'
        });

        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.background = 'rgba(59, 130, 246, 0.25)';
            resetBtn.style.transform = 'translateY(-2px)';
            resetBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        });

        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.background = 'rgba(59, 130, 246, 0.15)';
            resetBtn.style.transform = 'translateY(0)';
            resetBtn.style.boxShadow = 'none';
        });

        resetBtn.addEventListener('click', async () => {
            const futheroLauncherAPI = (window as any).futheroLauncherAPI;
            if (futheroLauncherAPI) {
                // Primeiro verifica se FPS está desbloqueado
                const isUnlocked = await futheroLauncherAPI.isUnlockedFps();

                // Se estiver desbloqueado, desativa
                if (isUnlocked) {
                    await futheroLauncherAPI.toggleUnlimitedFPS();
                }

                // Depois reseta o limite para null (padrão)
                await futheroLauncherAPI.setFpsLimit(null);
                updateCurrentFpsDisplay(null);
            }
        });

        container.appendChild(resetBtn);

        // Presets de FPS
        const presetsContainer = document.createElement('div');
        Object.assign(presetsContainer.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '15px'
        });

        const presets = [60, 120, 144, 240, 360, 480, 600, null]; // null = unlimited
        const presetLabels: { [key: string]: string } = {
            '60': '60',
            '120': '120',
            '144': '144',
            '240': '240',
            '360': '360',
            '480': '480',
            '600': '600',
            'null': '∞'
        };

        presets.forEach(fps => {
            const btn = document.createElement('button');
            btn.textContent = presetLabels[String(fps)] + ' FPS';

            Object.assign(btn.style, {
                padding: '10px',
                background: 'rgba(255, 103, 0, 0.1)',
                border: '1px solid rgba(255, 103, 0, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'futurept_b1',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 'bold'
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255, 103, 0, 0.2)';
                btn.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 103, 0, 0.1)';
                btn.style.transform = 'translateY(0)';
            });

            btn.addEventListener('click', async () => {
                const futheroLauncherAPI = (window as any).futheroLauncherAPI;
                if (futheroLauncherAPI) {
                    await futheroLauncherAPI.setFpsLimit(fps);
                    updateCurrentFpsDisplay(fps);
                }
            });

            presetsContainer.appendChild(btn);
        });

        container.appendChild(presetsContainer);

        // Input customizado
        const customInputContainer = document.createElement('div');
        Object.assign(customInputContainer.style, {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        });

        const customInput = document.createElement('input');
        customInput.type = 'number';
        customInput.placeholder = 'Custom FPS...';
        customInput.min = '30';
        customInput.max = '1000';

        Object.assign(customInput.style, {
            flex: '1',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 103, 0, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'futurept_b1',
            outline: 'none'
        });

        customInput.addEventListener('focus', () => {
            customInput.style.borderColor = 'rgba(255, 103, 0, 0.5)';
        });

        customInput.addEventListener('blur', () => {
            customInput.style.borderColor = 'rgba(255, 103, 0, 0.2)';
        });

        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Apply';

        Object.assign(applyBtn.style, {
            padding: '10px 20px',
            background: 'linear-gradient(135deg, rgba(255, 103, 0, 0.2) 0%, rgba(255, 103, 0, 0.1) 100%)',
            border: '1px solid rgba(255, 103, 0, 0.3)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'futurept_b1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 'bold'
        });

        applyBtn.addEventListener('mouseenter', () => {
            applyBtn.style.background = 'linear-gradient(135deg, rgba(255, 103, 0, 0.3) 0%, rgba(255, 103, 0, 0.2) 100%)';
            applyBtn.style.transform = 'scale(1.05)';
        });

        applyBtn.addEventListener('mouseleave', () => {
            applyBtn.style.background = 'linear-gradient(135deg, rgba(255, 103, 0, 0.2) 0%, rgba(255, 103, 0, 0.1) 100%)';
            applyBtn.style.transform = 'scale(1)';
        });

        applyBtn.addEventListener('click', async () => {
            const value = parseInt(customInput.value);
            if (value && value >= 30 && value <= 1000) {
                const futheroLauncherAPI = (window as any).futheroLauncherAPI;
                if (futheroLauncherAPI) {
                    await futheroLauncherAPI.setFpsLimit(value);
                    updateCurrentFpsDisplay(value);
                    customInput.value = '';
                }
            }
        });

        customInputContainer.appendChild(customInput);
        customInputContainer.appendChild(applyBtn);
        container.appendChild(customInputContainer);

        // Display do limite atual
        const currentLimitDisplay = document.createElement('div');
        currentLimitDisplay.id = 'current-fps-limit-display';
        Object.assign(currentLimitDisplay.style, {
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#ff6700',
            fontSize: '14px',
            fontWeight: 'bold'
        });

        // Carrega e exibe o limite atual
        (async () => {
            const futheroLauncherAPI = (window as any).futheroLauncherAPI;
            if (futheroLauncherAPI) {
                const config = await futheroLauncherAPI.getFpsConfig();
                console.log('[FPS Config]', config);

                if (config.isDefault) {
                    updateCurrentFpsDisplay(null);
                } else {
                    const currentLimit = await futheroLauncherAPI.getFpsLimit();
                    updateCurrentFpsDisplay(currentLimit);
                }
            }
        })();

        container.appendChild(currentLimitDisplay);

        return container;
    }

    function updateCurrentFpsDisplay(limit: number | null) {
        const display = document.getElementById('current-fps-limit-display');
        if (display) {
            if (limit === null) {
                display.textContent = 'Current: Default (Native - No limiter)';
                display.style.color = '#60a5fa';
            } else {
                display.textContent = `Current Limit: ${limit} FPS`;
                display.style.color = '#ff6700';
            }
        }
    }

    function createToggleOption(
        label: string,
        description: string,
        onToggle: () => Promise<boolean>,
        getInitialState: () => Promise<boolean>
    ) {
        const container = document.createElement('div');

        Object.assign(container.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            background: 'rgba(255, 103, 0, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 103, 0, 0.1)',
            marginBottom: '15px',
            transition: 'all 0.3s ease'
        });

        container.addEventListener('mouseenter', () => {
            container.style.background = 'rgba(255, 103, 0, 0.08)';
            container.style.borderColor = 'rgba(255, 103, 0, 0.2)';
        });

        container.addEventListener('mouseleave', () => {
            container.style.background = 'rgba(255, 103, 0, 0.05)';
            container.style.borderColor = 'rgba(255, 103, 0, 0.1)';
        });

        const textContainer = document.createElement('div');
        textContainer.innerHTML = `
            <div style="color: #fff; font-weight: bold; margin-bottom: 4px;">${label}</div>
            <div style="color: #888; font-size: 12px;">${description}</div>
        `;

        const toggle = createToggleSwitch(false, async (newState) => {
            const actualState = await onToggle();
            updateToggleState(toggle, actualState);
        });

        getInitialState().then(state => {
            updateToggleState(toggle, state);
        });

        container.appendChild(textContainer);
        container.appendChild(toggle);

        return container;
    }

    function createToggleSwitch(
        initialState: boolean,
        onChange: (state: boolean) => Promise<void>
    ) {
        const toggle = document.createElement('div');
        Object.assign(toggle.style, {
            width: '50px',
            height: '26px',
            background: initialState ? '#ff6700' : '#333',
            borderRadius: '13px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flexShrink: '0'
        });

        const knob = document.createElement('div');
        Object.assign(knob.style, {
            width: '20px',
            height: '20px',
            background: '#fff',
            borderRadius: '50%',
            position: 'absolute',
            top: '3px',
            left: initialState ? '27px' : '3px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        });

        toggle.appendChild(knob);

        let currentState = initialState;

        toggle.addEventListener('click', async () => {
            toggle.style.pointerEvents = 'none';

            try {
                await onChange(!currentState);
            } finally {
                toggle.style.pointerEvents = 'auto';
            }
        });

        return toggle;
    }

    function updateToggleState(toggle: HTMLElement, isActive: boolean) {
        const knob = toggle.querySelector('div') as HTMLElement;
        toggle.style.background = isActive ? '#ff6700' : '#333';
        if (knob) {
            knob.style.left = isActive ? '27px' : '3px';
        }
    }

    function createSection(icon: string, title: string, subtitle: string) {
        const section = document.createElement('div');
        Object.assign(section.style, {
            background: 'linear-gradient(135deg, #1a1f2e 0%, #151a24 100%)',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid rgba(255, 103, 0, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        });

        section.addEventListener('mouseenter', () => {
            section.style.transform = 'translateY(-5px)';
            section.style.boxShadow = '0 12px 48px rgba(255, 103, 0, 0.2)';
            section.style.borderColor = 'rgba(255, 103, 0, 0.3)';
        });

        section.addEventListener('mouseleave', () => {
            section.style.transform = 'translateY(0)';
            section.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            section.style.borderColor = 'rgba(255, 103, 0, 0.15)';
        });

        const sectionHeader = document.createElement('div');
        sectionHeader.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px; animation: float 3s ease-in-out infinite;">${icon}</div>
            <div style="font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 13px; color: #888;">${subtitle}</div>
        `;
        Object.assign(sectionHeader.style, {
            marginBottom: '25px'
        });

        section.appendChild(sectionHeader);

        return section;
    }

    function createButton(text: string, tooltip: string) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        Object.assign(btn.style, {
            width: '100%',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(255, 103, 0, 0.15) 0%, rgba(255, 103, 0, 0.08) 100%)',
            border: '2px solid rgba(255, 103, 0, 0.3)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontFamily: 'futurept_b1',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: 'bold',
            position: 'relative',
            overflow: 'hidden'
        });

        btn.setAttribute('title', tooltip);

        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'linear-gradient(135deg, rgba(255, 103, 0, 0.25) 0%, rgba(255, 103, 0, 0.15) 100%)';
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 8px 24px rgba(255, 103, 0, 0.3)';
            btn.style.borderColor = 'rgba(255, 103, 0, 0.5)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'linear-gradient(135deg, rgba(255, 103, 0, 0.15) 0%, rgba(255, 103, 0, 0.08) 100%)';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
            btn.style.borderColor = 'rgba(255, 103, 0, 0.3)';
        });

        return btn;
    }

    function createFooter() {
        const footer = document.createElement('div');
        footer.innerHTML = `
            <span style="color: #666;">Powered by</span>
            <span style="color: #ff6700; font-weight: bold; margin-left: 5px;">brenoluizdev</span>
            <span style="color: #666; margin-left: 15px;">•</span>
            <span style="color: #666; margin-left: 15px; font-size: 12px;">Version 2.1</span>
        `;
        Object.assign(footer.style, {
            padding: '20px 35px',
            borderTop: '2px solid rgba(255, 103, 0, 0.2)',
            background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: 'futurept_b1'
        });
        return footer;
    }

    function setupMutationObserver(iframeDoc: Document) {
        if (observerActive) return;

        const observer = new MutationObserver(() => {
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

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    function handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement);

        if (!isFullscreen) {
            setTimeout(() => {
                if (!menuInjected) {
                    waitForBonkUI();
                }
            }, 500);
        }
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
            } catch (e) { }
        }, 1000);
    }

    waitForBonkUI();
    monitorIframeNavigation();

    console.log("[BonkMenu] Inicialização completa");
})();