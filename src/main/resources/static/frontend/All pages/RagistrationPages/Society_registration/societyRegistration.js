document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');
    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const API_BASE_URL = 'https://managementapp-38ex.onrender.com';
    const LOGIN_PAGE_URL = '../Login_page/loginPage.html';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phonePattern = /^[0-9]{10}$/;

    // ===== 0. Toast Notification System (replaces alert()) =====
    (function injectToastStyles() {
        if (document.getElementById('toast-style-tag')) return;
        const style = document.createElement('style');
        style.id = 'toast-style-tag';
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
                pointer-events: none;
            }
            .toast {
                min-width: 260px;
                max-width: 90vw;
                padding: 14px 20px;
                border-radius: 10px;
                font-size: 14.5px;
                font-weight: 500;
                color: #fff;
                box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                gap: 10px;
                opacity: 0;
                transform: translateY(-16px);
                animation: toast-in 0.35s ease forwards;
                pointer-events: auto;
            }
            .toast.hide {
                animation: toast-out 0.3s ease forwards;
            }
            .toast-success { background: linear-gradient(135deg, #16a34a, #15803d); }
            .toast-error   { background: linear-gradient(135deg, #dc2626, #b91c1c); }
            .toast-icon { flex-shrink: 0; display: flex; }
            @keyframes toast-in {
                from { opacity: 0; transform: translateY(-16px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes toast-out {
                from { opacity: 1; transform: translateY(0); }
                to   { opacity: 0; transform: translateY(-16px); }
            }
        `;
        document.head.appendChild(style);
    })();

    function getToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(message, type = 'success', duration = 3200) {
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconSvg = type === 'success'
            ? '<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>'
            : '<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="13"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>';

        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    }

    // ===== 1. Live Password & Confirm Password Hints =====
    function updateHints() {
        const pass = passwordInput.value;
        const confirm = confirmInput.value;

        // Main Password Hint
        if (pass.length === 0) {
            passwordHint.textContent = 'Password must be exactly 4 digits';
            passwordHint.className = 'hint-msg';
        } else if (pass.length < 4) {
            passwordHint.textContent = `${pass.length}/4 digits entered`;
            passwordHint.className = 'hint-msg';
        } else {
            passwordHint.textContent = 'Valid password';
            passwordHint.className = 'hint-msg success';
        }

        // Confirm Password Hint
        if (confirm.length === 0) {
            confirmHint.textContent = 'Confirm your 4-digit PIN';
            confirmHint.className = 'hint-msg';
        } else if (confirm.length < 4) {
            confirmHint.textContent = `${confirm.length}/4 digits entered`;
            confirmHint.className = 'hint-msg';
        } else if (pass === confirm) {
            confirmHint.textContent = 'Passwords match';
            confirmHint.className = 'hint-msg success';
        } else {
            confirmHint.textContent = 'Passwords do not match';
            confirmHint.className = 'hint-msg error';
        }
    }

    // Restrict to digits only + max 4 chars + update hints
    [passwordInput, confirmInput].forEach(input => {
        input.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 4);
            updateHints();
        });
    });

    // ===== 1.5 Live Email Validation =====
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const field = emailInput.closest('.field');
            const value = emailInput.value.trim();
            if (!value || emailPattern.test(value)) {
                field.classList.remove('invalid');
            } else {
                field.classList.add('invalid');
            }
        });
        emailInput.addEventListener('blur', () => {
            const field = emailInput.closest('.field');
            const value = emailInput.value.trim();
            if (value && !emailPattern.test(value)) {
                field.classList.add('invalid');
            }
        });
    }

    // ===== 1.6 Live Phone Validation (digits only, max 10) =====
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
            const field = this.closest('.field');
            if (!this.value) {
                field.classList.remove('invalid');
            } else if (phonePattern.test(this.value)) {
                field.classList.remove('invalid');
            }
        });
        phoneInput.addEventListener('blur', function () {
            const field = this.closest('.field');
            if (this.value && !phonePattern.test(this.value)) {
                field.classList.add('invalid');
            }
        });
    }

    // ===== 2. Toggle Password Visibility with Icon Swap =====
    document.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const svg = btn.querySelector('svg');

            if (!input || !svg) return;

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.setAttribute('aria-label', isHidden ? 'Hide PIN' : 'Show PIN');

            if (isHidden) {
                svg.innerHTML = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.94 20.94 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.9 20.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
            } else {
                svg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
            }
        });
    });

    // ===== 3. Sign In Link Redirect =====
    const signInLink = document.getElementById('signInLink');
    if (signInLink) {
        signInLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = LOGIN_PAGE_URL;
        });
    }

    // ===== 4. Form Submission & Validation =====
    const pinPattern = /^[0-9]{4}$/;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));

        const requiredFields = ['societyName', 'societyAddress', 'regNumber', 'adminName', 'phone', 'email'];
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            const field = input.closest('.field');
            if (!input.value.trim()) {
                field.classList.add('invalid');
                valid = false;
            }
        });

        const emailField = emailInput.closest('.field');
        if (emailInput.value.trim() && !emailPattern.test(emailInput.value.trim())) {
            emailField.classList.add('invalid');
            valid = false;
        }

        const phoneField = phoneInput.closest('.field');
        if (phoneInput.value.trim() && !phonePattern.test(phoneInput.value.trim())) {
            phoneField.classList.add('invalid');
            valid = false;
        }

        const pinField = passwordInput.closest('.field');
        if (!pinPattern.test(passwordInput.value)) {
            pinField.classList.add('invalid');
            passwordHint.textContent = 'Password must be exactly 4 digits';
            passwordHint.className = 'hint-msg error';
            valid = false;
        }

        const confirmField = confirmInput.closest('.field');
        if (!pinPattern.test(confirmInput.value) || confirmInput.value !== passwordInput.value) {
            confirmField.classList.add('invalid');
            confirmHint.textContent = 'Passwords do not match';
            confirmHint.className = 'hint-msg error';
            valid = false;
        }

        if (!valid) {
            return;
        }

        const payload = {
            societyName: document.getElementById('societyName').value.trim(),
            address: document.getElementById('societyAddress').value.trim(),
            registrationNumber: document.getElementById('regNumber').value.trim(),
            adminName: document.getElementById('adminName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: passwordInput.value
        };

        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        fetch(API_BASE_URL + '/api/auth/register-society', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(async (response) => {
                const data = await response.text();
                if (response.ok) {
                    showToast(data || 'Society & Admin account created successfully!', 'success');
                    form.reset();
                    updateHints();
                    submitBtn.textContent = 'Redirecting to login...';
                    setTimeout(() => {
                        window.location.href = LOGIN_PAGE_URL;
                    }, 1500);
                    return; // keep button disabled while redirecting
                } else {
                    showToast(data || 'Something went wrong. Please try again.', 'error');
                }
            })
            .catch((error) => {
                showToast('Network error: could not reach server.', 'error');
                console.error('Fetch error:', error);
            })
            .finally(() => {
                // Only re-enable if we're NOT redirecting (i.e. an error happened)
                if (!submitBtn.textContent.includes('Redirecting')) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            });
    });
});

// ============================================
// Floating particles (crystal live background)
// ============================================
(function () {
    function spawnParticles(id, count, colors) {
        var container = document.getElementById(id);
        if (!container) return;
        var travel = window.innerHeight + 80;
        for (var i = 0; i < count; i++) {
            var p = document.createElement('span');
            p.className = 'particle';
            var size = (Math.random() * 6 + 3).toFixed(1);
            var left = (Math.random() * 100).toFixed(1);
            var speed = Math.random() * 25 + 40;
            var duration = (travel / speed).toFixed(1);
            var delay = (Math.random() * duration).toFixed(1);
            var drift = (Math.random() * 60 - 30).toFixed(0);
            var color = colors[i % colors.length];
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = left + '%';
            p.style.background = 'radial-gradient(circle, ' + color + ' 0%, rgba(59,130,246,0) 72%)';
            p.style.animationDuration = duration + 's';
            p.style.animationDelay = '-' + delay + 's';
            p.style.setProperty('--drift', drift + 'px');
            p.style.setProperty('--travel', travel + 'px');
            container.appendChild(p);
        }
    }

    function init() {
        var narrow = window.innerWidth < 600;
        spawnParticles('registerParticles', narrow ? 14 : 24, [
            'rgba(59,130,246,0.55)', 'rgba(37,99,235,0.5)', 'rgba(14,165,233,0.45)'
        ]);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();