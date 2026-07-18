<<<<<<< HEAD
// Mobile nav menu: open/close state, hamburger-to-X animation,
// auto-close on link tap, outside tap, or resize back to desktop.
=======
// FAQ accordion: clicking a question opens its answer and closes any other open one.
(function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            items.forEach(other => {
                other.classList.remove('open');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
})();

// Scroll-triggered reveal animations (fade up / fade in / slide left / slide right / scale in)
// Each element animates once, the first time it enters the viewport.
(function initScrollAnimations() {
    const animatedEls = document.querySelectorAll('[data-animate]');
    if (!animatedEls.length) return;

    // If the browser can't do IntersectionObserver, just show everything.
    if (!('IntersectionObserver' in window)) {
        animatedEls.forEach(el => el.classList.add('in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target); // animate only once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedEls.forEach(el => observer.observe(el));
})();

// Mobile nav toggle: reveal links list on small screens
>>>>>>> aa1e6249b79ba7de0d238f17ba1850577b9256dc
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav-links');

function openMenu(){
    links.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
}

function closeMenu(){
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    links.classList.contains('open') ? closeMenu() : openMenu();
});

// Close the menu after tapping a nav link
links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

// Close if tapping anywhere outside the menu/toggle
document.addEventListener('click', (e) => {
    if (!links.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
    }
});

// Close automatically if the viewport grows back to desktop size
window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
});