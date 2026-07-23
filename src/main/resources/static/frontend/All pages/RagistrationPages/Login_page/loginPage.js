// Wait for DOM to fully load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM Elements =====
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const toggleEye = document.getElementById('toggleEye');
    const eyeIcon = document.getElementById('eyeIcon');
    const forgotLink = document.getElementById('forgotLink');
    const loginForm = document.getElementById('loginForm');
    const passwordHint = document.getElementById('password-hint');

    // ===== Debug: Check if elements loaded =====
    if (!passwordInput || !toggleEye || !eyeIcon || !passwordHint) {
        console.error('One or more elements not found! Check your HTML IDs.');
        return;
    }

    // ============================================
    // Password Input: Digits only + Counter Hint
    // ============================================
    passwordInput.addEventListener('input', function () {
        // Allow only numbers, max 4 digits
        this.value = this.value.replace(/\D/g, '').slice(0, 4);

        // Update hint based on length
        if (passwordHint) {
            if (this.value.length === 0) {
                passwordHint.textContent = "Password must be exactly 4 digits";
                passwordHint.style.color = "#8A8FA3";
                passwordHint.className = "hint-msg";
            } else if (this.value.length < 4) {
                passwordHint.textContent = `${this.value.length}/4 digits entered , Password must be exactly 4 digits`;
                passwordHint.style.color = "#ff0000";
                passwordHint.className = "hint-msg";
            } else {
                passwordHint.textContent = "4/4 entered";
                passwordHint.style.color = "#2952E3"
                passwordHint.className = "hint-msg info";
            }
        }
    });

    // ============================================
    // Toggle Password Visibility (Eye Icon)
    // ============================================
    toggleEye.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';

        // Toggle input type
        passwordInput.type = isHidden ? 'text' : 'password';

        // Update ARIA label for accessibility
        toggleEye.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');

        // Swap SVG icon paths
        if (eyeIcon) {
            eyeIcon.innerHTML = isHidden
                ? `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.94 20.94 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.9 20.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
                   <line x1="1" y1="1" x2="23" y2="23"></line>`
                : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                   <circle cx="12" cy="12" r="3"></circle>`;
        }
    });

    // ============================================
    // Form Submission Handler (real backend call)
    // ============================================
    const API_BASE_URL = 'https://managementapp-38ex.onrender.com';
    const loginBtn = document.querySelector('.btn-login');
    const formMessage = document.getElementById('form-message');
    const alertIcon = document.getElementById('alert-icon');
    const alertText = document.getElementById('alert-text');

    // How long to wait before assuming the Render server is asleep (ms)
    const WAKE_UP_THRESHOLD_MS = 3000;

    const ICONS = {
        success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
        error: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
        // Simple spinner-style icon (spun via CSS) used for the "waking up" state
        info: '<circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path>'
    };

    function showMessage(text, type) {
        if (!formMessage) return;
        formMessage.hidden = false;
        formMessage.className = 'alert-banner ' + type; // 'error', 'success', or 'info'
        if (alertIcon) alertIcon.innerHTML = ICONS[type] || '';
        if (alertText) alertText.textContent = text;
    }

    function hideMessage() {
        if (formMessage) formMessage.hidden = true;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email')?.value.trim();
            const password = passwordInput.value;

            if (formMessage) {
                hideMessage();
            }

            // Validation
            if (!email || !password) {
                showMessage('Please fill in both fields.', 'error');
                return;
            }

            if (!/^\d{4}$/.test(password)) {
                if (passwordHint) {
                    passwordHint.textContent = "Password must be exactly 4 digits";
                    passwordHint.className = "hint-msg error";
                }
                return;
            }

            const payload = { email: email, password: password };

            const originalBtnText = loginBtn ? loginBtn.textContent : '';
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Logging in...';
            }

            // If the backend doesn't respond within WAKE_UP_THRESHOLD_MS,
            // assume the Render free-tier server was asleep and let the
            // user know instead of leaving them staring at a stuck button.
            const wakeUpTimer = setTimeout(() => {
                showMessage('Just a moment — our server is waking up from idle. This can take up to a minute on your first try.', 'info');
            }, WAKE_UP_THRESHOLD_MS);

            fetch(API_BASE_URL + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    const contentType = response.headers.get('content-type') || '';
                    const data = contentType.includes('application/json')
                        ? await response.json()
                        : await response.text();

                    if (response.ok) {
                        // Backend confirmed the email + password match.
                        // Save session info so the dashboard can identify the user.
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('role', data.role);
                        localStorage.setItem('name', data.name);
                        localStorage.setItem('email', email);

                        showMessage(`Welcome back, ${data.name}! Redirecting...`, 'success');

                        const destination = (data.role || '').toLowerCase() === 'admin'
                            ? '../../AdminPages/Dash_board/adminDashboard.html'
                            : '../../ResidentPage/Dashboard/mainDashboard.html';

                        setTimeout(() => {
                            window.location.href = destination;
                        }, 1000);
                    } else {
                        // Wrong email or wrong password -> backend rejects it
                        const errorText = typeof data === 'string' ? data : 'Incorrect email or password.';
                        showMessage(errorText, 'error');
                    }
                })
                .catch((error) => {
                    showMessage(`Could not reach server. Is the backend running on ${API_BASE_URL}?`, 'error');
                    console.error('Fetch error:', error);
                })
                .finally(() => {
                    // Whatever happened, the "waking up" message no longer applies
                    clearTimeout(wakeUpTimer);
                    if (loginBtn) {
                        loginBtn.disabled = false;
                        loginBtn.textContent = originalBtnText;
                    }
                });
        });
    }

    // ============================================
    // Pre-warm the server as soon as the login page
    // loads, so by the time the user finishes typing
    // their email/password the server is often already
    // awake and login feels instant.
    // ============================================
    fetch(API_BASE_URL + '/actuator/health').catch(() => {
        // Silently ignore - this is just a best-effort warm-up ping.
        // If /actuator/health isn't exposed on your backend, replace
        // this with any lightweight GET endpoint that exists.
    });

    // ============================================
    // Forgot Password Link
    // Now a plain link with its own href pointing
    // to the working Forgot Password page, so no
    // click handler / preventDefault is needed.
    // ============================================

    // ============================================
    // "Create an account" is now a plain link with
    // its own href, so no click handler is needed.
    // ============================================

});

// ============================================
// Floating particles (crystal live background)
// Self-contained: runs even if the form fields
// above are missing, so the background never
// silently fails to load.
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
            var speed = Math.random() * 25 + 40; /* px per second */
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
        spawnParticles('loginParticles', narrow ? 14 : 24, [
            'rgba(59,130,246,0.55)', 'rgba(37,99,235,0.5)', 'rgba(14,165,233,0.45)'
        ]);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();