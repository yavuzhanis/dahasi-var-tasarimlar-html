(() => {
    'use strict';
    const cover = document.querySelector('[data-editorial-cover]');
    if (!cover) return;
    const choices = [...cover.querySelectorAll('[data-cover-choice]')];
    const panels = [...cover.querySelectorAll('[data-cover-panel]')];
    const status = cover.querySelector('[data-cover-status]');
    choices.forEach(choice => {
        choice.addEventListener('click', event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const id = choice.dataset.coverChoice;
            if (!panels.some(panel => panel.dataset.coverPanel === id)) return;
            event.preventDefault();
            panels.forEach(panel => { panel.hidden = panel.dataset.coverPanel !== id; });
            choices.forEach(link => {
                if (link === choice) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
            if (status) status.textContent = `Kapakta: ${choice.querySelector('strong').textContent}`;
            if (cover.getBoundingClientRect().top < 0) cover.scrollIntoView({ block: 'start' });
        });
    });
})();
