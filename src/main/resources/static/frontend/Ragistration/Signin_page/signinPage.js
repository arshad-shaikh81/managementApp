document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM Elements =====
    const page = document.querySelector('.page');
    const form = document.querySelector('form');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');
    const toggleButtons = document.querySelectorAll('.toggle-eye');
    const navLinks = document.querySelectorAll('.footer-links a');

    // ============================================
    // PIN fields: digits only + live hint
    // ============================================
    function wireDigitField(input, hint, defaultText) {
        if (!input || !hint) return;
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '').slice(0, 4);
            if (input.value.length === 0) {
                hint.textContent = defaultText;
                hint.className = 'hint-msg';
            } else if (input.value.length < 4) {
                hint.textContent = `${input.value.length}/4 digits entered`;
                hint.className = 'hint-msg';
            } else {
                hint.textContent = 'Valid PIN';
                hint.className = 'hint-msg success';
            }
        });
    }
    wireDigitField(passwordInput, passwordHint, 'Password must be exactly 4 digits');
    wireDigitField(confirmInput, confirmHint, 'Confirm your 4-digit PIN');

    // ============================================
    // Show/hide PIN (works for both password fields)
    // ============================================
    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.setAttribute('aria-label', isHidden ? 'Hide PIN' : 'Show PIN');

            const eyeSvg = btn.querySelector('.eye-svg');
            if (eyeSvg) {
                eyeSvg.innerHTML = isHidden
                    ? `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.94 20.94 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.9 20.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
                       <line x1="1" y1="1" x2="23" y2="23"></line>`
                    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"></path>
                       <circle cx="12" cy="12" r="3"></circle>`;
            }
        });
    });

    // ============================================
    // Form submission
    // ============================================
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!/^\d{4}$/.test(passwordInput.value)) {
                passwordHint.textContent = 'Password must be exactly 4 digits';
                passwordHint.className = 'hint-msg error';
                return;
            }

            if (confirmInput.value !== passwordInput.value) {
                confirmHint.textContent = "PINs don't match";
                confirmHint.className = 'hint-msg error';
                return;
            }

            alert('Account created!\n(Connect this to your backend to register the user.)');
            // Redirect example: window.location.href = '../Login_page/loginPage.html';
        });
    }

    // ============================================
    // Footer links ("Register your society" / "Log in")
    // Play the exit flip, then navigate.
    // ============================================
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            let href = link.getAttribute('href');
            if (!href) return;
            e.preventDefault();
            if (page) {
                page.classList.add('leaving');
                setTimeout(() => { window.location.href = href = "../Society_registration/societyRegistration.html"; }, 180);
            } else {
                window.location.href = href;
            }
        });
    });

});