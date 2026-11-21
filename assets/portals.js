(() => {
    'use strict';
    const root = document.querySelector('[data-portals]');
    if (!root) return;
    const doors = Array.from(root.querySelectorAll('[data-door]'));
    if (!doors.length) return;
    const headline = root.querySelector('[data-portal-headline]');
    const description = root.querySelector('[data-portal-description]');
    const link = root.querySelector('[data-portal-link]');
    const status = root.querySelector('[data-portal-status]');
    const overlay = document.querySelector('[data-portal-transition]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let entering = false;
    let navigated = false;
    let timer;
    let sourceDoor;
    let completeNavigation;
    let entryVersion = 0;
    let animations = [];

    function select(index, announce = false) {
        if (entering || !Number.isInteger(index) || index < 0 || index >= doors.length) return;
        current = index;
        doors.forEach((door, i) => {
            door.classList.toggle('is-active', i === index);
            door.setAttribute('aria-current', String(i === index));
        });
        const data = doors[index].dataset;
        root.dataset.theme = data.program;
        headline.textContent = data.headline;
        description.textContent = data.description;
        link.textContent = data.label + ': Kapıyı aç';
        link.setAttribute('href', doors[index].getAttribute('href'));
        if (announce) status.textContent = data.label + ' seçildi. Kapıyı açarak siteye girebilirsiniz.';
    }

    function reset(restoreFocus = false) {
        entryVersion++;
        entering = false;
        navigated = false;
        window.clearTimeout(timer);
        completeNavigation = null;
        animations.forEach(animation => animation.cancel());
        animations = [];
        if (overlay) { overlay.hidden = true; overlay.replaceChildren(); }
        delete root.dataset.entering;
        root.removeAttribute('aria-busy');
        root.inert = false;
        if (restoreFocus) sourceDoor?.focus();
    }

    function enter(event, index) {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (event.button != null && event.button !== 0)) return;
        if (entering) { event.preventDefault(); return; }
        select(index);
        const door = doors[index];
        const destination = door.getAttribute('href');
        // Native navigation remains the fallback, including reduced motion and new-tab gestures.
        if (reducedMotion.matches || !overlay || typeof door.animate !== 'function') return;
        const rect = door.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        event.preventDefault();
        entering = true;
        const version = ++entryVersion;
        sourceDoor = door;
        root.dataset.entering = 'true';
        root.setAttribute('aria-busy', 'true');
        status.textContent = door.dataset.label + ' kapısı açılıyor.';
        root.inert = true;

        const finish = () => {
            if (!entering || navigated || version !== entryVersion) return;
            navigated = true;
            window.clearTimeout(timer);
            if (destination.startsWith('#')) reset();
            window.location.assign(destination);
        };
        completeNavigation = finish;
        // A timer also completes entry if an animation completion event is unavailable.
        timer = window.setTimeout(finish, 1150);
        try {
            const backdrop = document.createElement('div');
            backdrop.className = 'transition-backdrop';
            const chamber = door.cloneNode(true);
            chamber.classList.toggle('transition-door', true);
            chamber.removeAttribute('href');
            chamber.setAttribute('tabindex', '-1');
            chamber.setAttribute('aria-hidden', 'true');
            const veil = document.createElement('div');
            veil.className = 'transition-veil';
            overlay.replaceChildren(backdrop, chamber, veil);
            overlay.hidden = false;
            const opening = chamber.animate([
                { top: rect.top + 'px', left: rect.left + 'px', width: rect.width + 'px', height: rect.height + 'px', borderRadius: rect.width / 2 + 'px ' + rect.width / 2 + 'px 8px 8px', transform: 'none' },
                { top: '-6vh', left: '-6vw', width: '112vw', height: '112vh', borderRadius: '38% 38% 0 0', transform: 'none' }
            ], { duration: 1050, easing: 'cubic-bezier(.45,0,.15,1)', fill: 'forwards' });
            animations = [
                opening,
                backdrop.animate([{ opacity: 0 }, { opacity: .88 }], { duration: 220, fill: 'forwards' }),
                veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 850, fill: 'forwards' })
            ];
            opening.finished.then(finish, finish);
        } catch {
            finish();
        }
    }

    doors.forEach((door, index) => {
        door.addEventListener('pointerenter', event => {
            if (event.pointerType === 'mouse') select(index);
        });
        door.addEventListener('focus', () => select(index, true));
        door.addEventListener('click', event => enter(event, index));
        door.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = (index + 1) % doors.length;
            else if (event.key === 'ArrowLeft') next = (index + doors.length - 1) % doors.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = doors.length - 1;
            else return;
            event.preventDefault();
            select(next, true);
            doors[next].focus();
        });
    });
    link.addEventListener('click', event => enter(event, current));
    document.addEventListener('keydown', event => {
        if (entering && event.key === 'Escape') {
            event.preventDefault();
            reset(true);
            status.textContent = 'Giriş iptal edildi. Başka bir kapı seçebilirsiniz.';
        }
    });
    window.addEventListener('pageshow', () => reset());
    reducedMotion.addEventListener('change', event => {
        if (event.matches) completeNavigation?.();
    });
    const initial = Number(root.dataset.initial);
    select(Number.isInteger(initial) && initial >= 0 && initial < doors.length ? initial : 0);
})();
