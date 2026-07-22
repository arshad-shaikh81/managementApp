document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM Elements =====
    const form = document.querySelector('form');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');
    const toggleButtons = document.querySelectorAll('.toggle-eye');
    const emailInput = document.getElementById('email');
    const emailHint = document.getElementById('email-hint');
    const phoneInput = document.getElementById('phone');
    const phoneHint = document.getElementById('phone-hint');

    // ============================================
    // Phone field: digits only, max 10 digits + live hint
    // ============================================
    const phonePattern = /^[0-9]{10}$/;

    function updatePhoneHint() {
        if (!phoneInput || !phoneHint) return true;
        const value = phoneInput.value;

        if (value.length === 0) {
            phoneHint.textContent = '';
            phoneHint.className = 'hint-msg';
            phoneInput.classList.remove('invalid');
            return false;
        }
        if (value.length < 10) {
            phoneHint.textContent = `${value.length}/10 digits entered`;
            phoneHint.className = 'hint-msg';
            phoneInput.classList.remove('invalid');
            return false;
        }
        if (!phonePattern.test(value)) {
            phoneHint.textContent = 'Enter a valid 10-digit phone number';
            phoneHint.className = 'hint-msg error';
            phoneInput.classList.add('invalid');
            return false;
        }
        phoneHint.textContent = 'Valid phone number';
        phoneHint.className = 'hint-msg success';
        phoneInput.classList.remove('invalid');
        return true;
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
            updatePhoneHint();
        });
        phoneInput.addEventListener('blur', updatePhoneHint);
    }

    // ============================================
    // PIN fields: digits only + live hint
    // (Confirm PIN is checked AGAINST the Password
    //  field, not just its own digit count, so a
    //  mismatched PIN can no longer show "Valid PIN")
    // ============================================
    function updatePinHints() {
        const pass = passwordInput.value;
        const confirm = confirmInput.value;

        if (pass.length === 0) {
            passwordHint.textContent = 'Password must be exactly 4 digits';
            passwordHint.className = 'hint-msg';
        } else if (pass.length < 4) {
            passwordHint.textContent = `${pass.length}/4 digits entered`;
            passwordHint.className = 'hint-msg';
        } else {
            passwordHint.textContent = 'Valid PIN';
            passwordHint.className = 'hint-msg success';
        }

        if (confirm.length === 0) {
            confirmHint.textContent = 'Confirm your 4-digit PIN';
            confirmHint.className = 'hint-msg';
        } else if (confirm.length < 4) {
            confirmHint.textContent = `${confirm.length}/4 digits entered`;
            confirmHint.className = 'hint-msg';
        } else if (confirm === pass) {
            confirmHint.textContent = 'PINs match';
            confirmHint.className = 'hint-msg success';
        } else {
            confirmHint.textContent = "PINs don't match";
            confirmHint.className = 'hint-msg error';
        }
    }

    [passwordInput, confirmInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '').slice(0, 4);
            updatePinHints();
        });
    });

    // ============================================
    // Email field: live format validation
    // (exact "name@domain.tld" pattern, matching
    //  the error style used elsewhere in the app)
    // ============================================
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validateEmail() {
        if (!emailInput || !emailHint) return true;
        const value = emailInput.value.trim();

        if (value.length === 0) {
            emailHint.textContent = '';
            emailHint.className = 'hint-msg';
            emailInput.classList.remove('invalid');
            return false;
        }
        if (!emailPattern.test(value)) {
            emailHint.textContent = 'Enter a valid email address';
            emailHint.className = 'hint-msg error';
            emailInput.classList.add('invalid');
            return false;
        }
        emailHint.textContent = '';
        emailHint.className = 'hint-msg';
        emailInput.classList.remove('invalid');
        return true;
    }

    if (emailInput) {
        emailInput.addEventListener('input', validateEmail);
        emailInput.addEventListener('blur', validateEmail);
    }

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
    const API_BASE_URL = 'https://managementapp-38ex.onrender.com';
    const submitBtn = document.querySelector('.submit-btn');
    const societyHint = document.getElementById('society-hint');
    const formMessage = document.getElementById('form-message');

    // How long to wait before assuming the Render server is asleep (ms)
    const WAKE_UP_THRESHOLD_MS = 3000;

    function clearMessages() {
        if (societyHint) {
            societyHint.textContent = '';
            societyHint.className = 'hint-msg';
        }
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.className = 'hint-msg';
        }
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            clearMessages();

            if (!validateEmail()) {
                emailInput.focus();
                return;
            }

            if (!phonePattern.test(phoneInput.value)) {
                phoneHint.textContent = 'Enter a valid 10-digit phone number';
                phoneHint.className = 'hint-msg error';
                phoneInput.classList.add('invalid');
                phoneInput.focus();
                return;
            }

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

            const payload = {
                name: document.getElementById('fullname').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phone').value.trim(),
                password: passwordInput.value,
                societyName: document.getElementById('society').value.trim(),
                flatNumber: document.getElementById('flat').value.trim()
            };

            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating account...';
            }

            // If the backend doesn't respond within WAKE_UP_THRESHOLD_MS,
            // assume the Render free-tier server was asleep and let the
            // user know instead of leaving them staring at a stuck button.
            const wakeUpTimer = setTimeout(() => {
                if (formMessage) {
                    formMessage.innerHTML = '<span class="spinner"></span><span>Just a moment — our server is waking up from idle. This can take up to a minute on your first try.</span>';
                    formMessage.className = 'hint-msg info';
                }
            }, WAKE_UP_THRESHOLD_MS);

            fetch(API_BASE_URL + '/api/auth/register-resident', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    const data = await response.text();
                    if (response.ok) {
                        if (formMessage) {
                            formMessage.textContent = data || 'Account created successfully! Redirecting to login...';
                            formMessage.className = 'hint-msg success';
                        }
                        // Redirect to login page after a short pause so the message is visible
                        setTimeout(() => {
                            window.location.href = '../Login_page/loginPage.html';
                        }, 1200);
                    } else if (data && data.toLowerCase().includes('society not found')) {
                        // Show this specific error right under the Society Name field
                        if (societyHint) {
                            societyHint.textContent = "This society isn't registered yet. Please check the name or register your society first.";
                            societyHint.className = 'hint-msg error';
                        }
                    } else {
                        if (formMessage) {
                            formMessage.textContent = data || 'Something went wrong. Please try again.';
                            formMessage.className = 'hint-msg error';
                        }
                    }
                })
                .catch((error) => {
                    if (formMessage) {
                        formMessage.textContent = `Could not reach server. Is the backend running on ${API_BASE_URL}?`;
                        formMessage.className = 'hint-msg error';
                    }
                    console.error('Fetch error:', error);
                })
                .finally(() => {
                    // Whatever happened, the "waking up" message no longer applies
                    clearTimeout(wakeUpTimer);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                });
        });
    }

    // ============================================
    // Pre-warm the server as soon as the signup page
    // loads, so by the time the user finishes filling
    // the form the server is often already awake.
    // ============================================
    fetch(API_BASE_URL + '/actuator/health').catch(() => {
        // Silently ignore - this is just a best-effort warm-up ping.
        // If /actuator/health isn't exposed on your backend, replace
        // this with any lightweight GET endpoint that exists.
    });

    // ============================================
    // Footer links ("Register your society" / "Log in")
    // No JS needed -- each <a href="..."> already
    // navigates to its own correct page normally.
    // ============================================

});

// ============================================
// Floating particles (crystal live background)
// Self-contained: runs independently of the
// form logic above.
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
        spawnParticles('signinParticles', narrow ? 14 : 24, [
            'rgba(59,130,246,0.55)', 'rgba(37,99,235,0.5)', 'rgba(14,165,233,0.45)'
        ]);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();