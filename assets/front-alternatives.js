(() => {
    'use strict';

    const explorer = document.querySelector('[data-explorer]');
    if (explorer) {
        const tablist = explorer.querySelector('.program-tabs');
        const tabs = [...explorer.querySelectorAll('[data-tab]')];
        const details = [...explorer.querySelectorAll('[data-detail]')];
        const valid = id => tabs.some(tab => tab.dataset.tab === id);
        const hashProgram = () => {
            const match = /^#detay-(yandal|mikro|sem|kariyer)$/.exec(location.hash);
            return match ? match[1] : null;
        };
        const select = (id, focus = false) => {
            if (!valid(id)) return;
            tabs.forEach(tab => {
                const active = tab.dataset.tab === id;
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
                if (active && focus) tab.focus();
            });
            details.forEach(detail => { detail.hidden = detail.dataset.detail !== id; });
        };

        tablist.setAttribute('role', 'tablist');
        tabs.forEach((tab, index) => {
            const id = tab.dataset.tab;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', `detay-${id}`);
            tab.addEventListener('click', event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                select(id);
            });
            tab.addEventListener('keydown', event => {
                let next;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = tabs.length - 1;
                if (next !== undefined) {
                    event.preventDefault();
                    select(tabs[next].dataset.tab, true);
                }
                if (event.key === ' ') {
                    event.preventDefault();
                    select(id);
                }
            });
        });
        details.forEach(detail => {
            detail.setAttribute('role', 'tabpanel');
            detail.setAttribute('aria-labelledby', `secim-${detail.dataset.detail}`);
            detail.tabIndex = 0;
        });
        document.querySelectorAll('[data-detail-link]').forEach(link => {
            link.addEventListener('click', event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                select(link.dataset.detailLink);
            });
        });
        window.addEventListener('hashchange', () => {
            const id = hashProgram();
            if (id) select(id);
        });
        select(hashProgram() || explorer.dataset.selected);
    }

    const stage = document.querySelector('[data-path-stage]');
    if (stage) {
        const paths = [...stage.querySelectorAll('[data-path]')];
        const select = id => {
            paths.forEach(path => {
                const active = path.dataset.path === id;
                path.classList.toggle('is-active', active);
                path.querySelector('[data-path-select]').setAttribute('aria-expanded', String(active));
                path.querySelector('.path-summary').hidden = !active;
            });
        };
        stage.classList.add('is-enhanced');
        paths.forEach(path => {
            const button = path.querySelector('[data-path-select]');
            button.disabled = false;
            button.setAttribute('aria-controls', path.querySelector('.path-summary').id);
            button.addEventListener('click', () => select(path.dataset.path));
            path.addEventListener('pointerenter', event => {
                if (event.pointerType === 'mouse' && !stage.contains(document.activeElement)) select(path.dataset.path);
            });
            button.addEventListener('focus', () => select(path.dataset.path));
        });
        select(stage.dataset.selected);
    }
})();
