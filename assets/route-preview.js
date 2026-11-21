(() => {
    'use strict';
    const options = [...document.querySelectorAll('[data-route-option]')];
    const choices = [...document.querySelectorAll('[data-route-choice]')];
    const status = document.querySelector('[data-route-status]');
    function selectRoute(id) {
        const selected = options.find(option => option.dataset.routeOption === id);
        if (!selected) return;
        options.forEach(option => { option.open = option === selected; });
        choices.forEach(choice => {
            if (choice.dataset.routeChoice === id) choice.setAttribute('aria-current', 'true');
            else choice.removeAttribute('aria-current');
        });
        if (status) status.textContent = `Keşfettiğin rota: ${selected.querySelector('h3').textContent}`;
    }
    // Open before native anchor scrolling, including repeated clicks on the same fragment.
    choices.forEach(choice => choice.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        selectRoute(choice.dataset.routeChoice);
    }));
    options.forEach(option => option.addEventListener('toggle', () => {
        if (option.open) selectRoute(option.dataset.routeOption);
        else if (!options.some(item => item.open)) {
            choices.forEach(choice => choice.removeAttribute('aria-current'));
            if (status) status.textContent = 'Keşfetmek istediğin rotayı seç.';
        }
    }));
    function revealRoute() {
        const match = /^#rota-(yandal|mikro|sem|kariyer)$/.exec(location.hash);
        if (!match) return;
        selectRoute(match[1]);
    }
    window.addEventListener('hashchange', revealRoute);
    revealRoute();
})();
