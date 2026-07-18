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
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
    const isOpen = links.style.display === 'flex';
    links.style.display = isOpen ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '70px';
    links.style.right = '24px';
    links.style.background = 'rgba(255,255,255,0.9)';
    links.style.backdropFilter = 'blur(14px)';
    links.style.border = '1px solid var(--card-border)';
    links.style.borderRadius = '16px';
    links.style.padding = '16px 24px';
    links.style.gap = '16px';
    links.style.boxShadow = '0 12px 28px -12px rgba(15,27,51,0.25)';
});