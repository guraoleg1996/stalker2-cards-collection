document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.nav-item');
    const tab1Content = document.getElementById('tab1-content');
    const tab2Content = document.getElementById('tab2-content');

    function pauseAllAudios() {
        document.querySelectorAll('audio').forEach(a => a.pause());
        document.querySelectorAll('#btn1, #btn2').forEach(b => { if (b) b.textContent = '▶'; });
    }

    function activateTab(tabId) {
        if (tabId === 'tab1') {
            tab1Content.classList.remove('hidden');
            tab2Content.classList.add('hidden');
            tabButtons[0].classList.add('active');
            tabButtons[1].classList.remove('active');
            tabButtons[0].setAttribute('aria-selected', 'true');
            tabButtons[1].setAttribute('aria-selected', 'false');
        } else {
            tab2Content.classList.remove('hidden');
            tab1Content.classList.add('hidden');
            tabButtons[0].classList.remove('active');
            tabButtons[1].classList.add('active');
            tabButtons[0].setAttribute('aria-selected', 'false');
            tabButtons[1].setAttribute('aria-selected', 'true');
        }
        pauseAllAudios();
        requestAnimationFrame(() => {
            setTimeout(updateTextWrapHeight, 30);
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });

    function setupPlayer(audioId, btnId, containerId, barId) {
        const audio = document.getElementById(audioId);
        const btn = document.getElementById(btnId);
        const container = document.getElementById(containerId);
        const bar = document.getElementById(barId);
        if (!audio || !btn || !container || !bar) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause(); });
            document.querySelectorAll('#btn1, #btn2').forEach(b => { if (b !== btn) b.textContent = '▶'; });
            if (audio.paused) {
                audio.play().catch(() => { });
                btn.textContent = '⏸';
            } else {
                audio.pause();
                btn.textContent = '▶';
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration && !isNaN(audio.duration)) {
                const percent = (audio.currentTime / audio.duration) * 100;
                bar.style.width = percent + '%';
                container.setAttribute('aria-valuenow', Math.round(percent));
            }
        });

        audio.addEventListener('ended', () => {
            btn.textContent = '▶';
            bar.style.width = '0%';
            container.setAttribute('aria-valuenow', '0');
        });

        container.addEventListener('click', (e) => {
            const rect = container.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (audio.duration && !isNaN(audio.duration)) {
                audio.currentTime = Math.max(0, Math.min(1, clickPos)) * audio.duration;
            }
        });

        audio.addEventListener('pause', () => btn.textContent = '▶');
        audio.addEventListener('play', () => btn.textContent = '⏸');
    }

    setupPlayer('audio1', 'btn1', 'progress-container1', 'progress-bar1');
    setupPlayer('audio2', 'btn2', 'progress-container2', 'progress-bar2');

    function isLandscape() {
        return window.matchMedia("(orientation: landscape)").matches;
    }

    function updateTextWrapHeight() {
        const textWraps = document.querySelectorAll('.text-wrap');
        if (!textWraps.length) return;

        if (isLandscape()) {
            const content = document.querySelector('.content');
            const nav = document.querySelector('.nav');
            const activeTab = document.querySelector('[role="tabpanel"]:not(.hidden)');
            const player = activeTab ? activeTab.querySelector('.pleyer') : null;
            if (!content) return;

            let usedHeight = 0;
            if (nav) usedHeight += nav.offsetHeight;
            if (player) usedHeight += player.offsetHeight;
            const contentPadding = 20;
            const available = content.clientHeight - usedHeight - contentPadding;

            textWraps.forEach(wrap => {
                wrap.style.maxHeight = `${Math.max(available, 100) - 20}px`;
                wrap.style.overflow = 'hidden';
            });
        } else {
            const shapka = document.querySelector('.shapka');
            const nav = document.querySelector('.nav');
            const activeTab = document.querySelector('[role="tabpanel"]:not(.hidden)');
            const player = activeTab ? activeTab.querySelector('.pleyer') : null;

            let bottom = 0;
            if (shapka) bottom = shapka.getBoundingClientRect().bottom;
            if (nav && nav.getBoundingClientRect().bottom > bottom) bottom = nav.getBoundingClientRect().bottom;
            if (player && player.getBoundingClientRect().bottom > bottom) bottom = player.getBoundingClientRect().bottom;

            const textWrapTop = textWraps[0].getBoundingClientRect().top;
            const available = window.innerHeight - Math.max(bottom, textWrapTop) - 20;

            textWraps.forEach(wrap => {
                wrap.style.maxHeight = `${Math.max(available, 165)}px`;
                wrap.style.overflow = 'hidden';
            });
        }

        document.querySelectorAll('.description').forEach(desc => {
            desc.style.overflowY = 'auto';
            desc.style.maxHeight = '100%';
            desc.style.height = '100%';
        });
    }

    window.addEventListener('load', () => {
        updateTextWrapHeight();
        const images = document.querySelectorAll('img');
        let loaded = 0;
        images.forEach(img => {
            if (img.complete) loaded++;
            else img.addEventListener('load', () => { loaded++; if (loaded === images.length) updateTextWrapHeight(); });
        });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            requestAnimationFrame(updateTextWrapHeight);
        }, 100);
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(updateTextWrapHeight, 50);
    });

    const observer = new MutationObserver(() => updateTextWrapHeight());
    observer.observe(tab1Content, { attributes: true, attributeFilter: ['class'] });
    observer.observe(tab2Content, { attributes: true, attributeFilter: ['class'] });

    activateTab('tab1');
});