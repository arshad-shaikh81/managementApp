// Mobile nav menu: open/close state, hamburger-to-X animation,
// auto-close on link tap, outside tap, or resize back to desktop.
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