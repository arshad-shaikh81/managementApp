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