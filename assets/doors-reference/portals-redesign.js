(() => {
  'use strict';
  const doors = Array.from(document.querySelectorAll('[data-door]'));
  if (!doors.length) return;
  const overlay = document.querySelector('[data-portal-transition]');
  const status = document.querySelector('[data-portal-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let entering = false;
  let timer;

  doors.forEach((door) => {
    door.addEventListener('click', (event) => {
      // Preserve opening links in another tab or window.
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (event.button != null && event.button !== 0)) return;
      if (entering) { event.preventDefault(); return; }

      const destination = door.getAttribute('href');
      if (!destination || reducedMotion.matches || !overlay || typeof door.animate !== 'function') return;
      const rect = door.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      event.preventDefault();
      entering = true;
      door.setAttribute('aria-busy', 'true');
      const programLabel = door.querySelector('strong')?.textContent?.trim() || 'Seçilen program';
      if (status) status.textContent = `${programLabel} açılıyor...`;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        if (destination.startsWith('#')) {
          entering = false;
          if (overlay) { overlay.hidden = true; overlay.replaceChildren(); }
          door.removeAttribute('aria-busy');
          door.classList.remove('is-entering');
        }
        window.location.assign(destination);
      };
      // Still follow the link if an animation fails or stalls.
      timer = window.setTimeout(finish, 1600);

      try {
        const style = window.getComputedStyle(door);
        const backdrop = document.createElement('div');
        backdrop.className = 'transition-backdrop';

        // Keep the doorway still while its entire front swings on one hinge.
        const frame = document.createElement('div');
        frame.className = 'transition-frame';
        Object.assign(frame.style, {
          top: `${rect.top}px`, left: `${rect.left}px`,
          width: `${rect.width}px`, height: `${rect.height}px`,
          borderRadius: style.borderRadius,
          borderWidth: style.borderWidth,
          borderColor: style.borderColor,
          perspective: `${Math.max(1200, rect.width * 3)}px`
        });

        const chamber = door.cloneNode(true);
        chamber.classList.add('transition-door');
        ['href', 'data-door', 'data-program', 'aria-busy', 'aria-label'].forEach((name) => chamber.removeAttribute(name));
        chamber.setAttribute('tabindex', '-1');
        chamber.setAttribute('aria-hidden', 'true');
        const photo = chamber.querySelector('.door-photo img');
        if (photo) photo.style.transform = window.getComputedStyle(door.querySelector('.door-photo img')).transform;
        frame.append(chamber);

        const veil = document.createElement('div');
        veil.className = 'transition-veil';
        overlay.replaceChildren(backdrop, frame, veil);
        overlay.hidden = false;
        door.classList.add('is-entering');

        chamber.animate([
          { transform: 'rotateY(0deg)', filter: 'brightness(1)' },
          { transform: 'rotateY(-105deg)', filter: 'brightness(.55)' }
        ], {
          duration: 850, delay: 80,
          easing: 'cubic-bezier(.35, 0, .2, 1)', fill: 'both'
        });

        // Move through the opening only after the single door has swung aside.
        const scale = Math.max((window.innerWidth + 80) / rect.width, (window.innerHeight + 80) / rect.height);
        const offsetX = window.innerWidth / 2 - (rect.left + rect.width / 2);
        const offsetY = window.innerHeight / 2 - (rect.top + rect.height / 2);
        frame.animate([
          { transform: 'translate(0, 0) scale(1)' },
          { transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }
        ], {
          duration: 550, delay: 700,
          easing: 'cubic-bezier(.55, 0, .2, 1)', fill: 'both'
        });
        backdrop.animate([{ opacity: 0 }, { opacity: .94 }], { duration: 280, fill: 'forwards' });
        const arrival = veil.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200, delay: 1100, fill: 'both'
        });
        arrival.finished.then(finish, finish);
      } catch (err) {
        finish();
      }
    });
  });

  window.addEventListener('pageshow', () => {
    entering = false;
    window.clearTimeout(timer);
    if (overlay) {
      overlay.hidden = true;
      overlay.replaceChildren();
    }
    doors.forEach((door) => {
      door.removeAttribute('aria-busy');
      door.classList.remove('is-entering');
    });
    if (status) status.textContent = '';
  });
})();
