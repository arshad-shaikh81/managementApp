// Wait for DOM to fully load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM Elements =====
    const passwordInput = document.getElementById('password');
    const mobileInput = document.getElementById('mobile');
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
    // Mobile Number: Digits only, max 10 digits
    // ============================================
    if (mobileInput) {
        mobileInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
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
    const API_BASE_URL = 'http://localhost:8080';
    const loginBtn = document.querySelector('.btn-login');
    const formMessage = document.getElementById('form-message');
    const alertIcon = document.getElementById('alert-icon');
    const alertText = document.getElementById('alert-text');

    const ICONS = {
        success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
        error: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
    };

    function showMessage(text, type) {
        if (!formMessage) return;
        formMessage.hidden = false;
        formMessage.className = 'alert-banner ' + type; // 'error' or 'success'
        if (alertIcon) alertIcon.innerHTML = ICONS[type] || '';
        if (alertText) alertText.textContent = text;
    }

    function hideMessage() {
        if (formMessage) formMessage.hidden = true;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const mobile = document.getElementById('mobile')?.value.trim();
            const password = passwordInput.value;

            if (formMessage) {
                hideMessage();
            }

            // Validation
            if (!mobile || !password) {
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

            const payload = { phone: mobile, password: password };

            const originalBtnText = loginBtn ? loginBtn.textContent : '';
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Logging in...';
            }

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
                        // Backend confirmed the mobile number + password match.
                        // Save session info so the dashboard can identify the user.
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('role', data.role);
                        localStorage.setItem('name', data.name);

                        showMessage(`Welcome back, ${data.name}! Redirecting...`, 'success');

                        setTimeout(() => {
                            // TODO: point this at the real dashboard page once it exists
                            window.location.href = '../Home_page/homePage.html';
                        }, 1000);
                    } else {
                        // Wrong mobile number or wrong password -> backend rejects it
                        const errorText = typeof data === 'string' ? data : 'Incorrect mobile number or password.';
                        showMessage(errorText, 'error');
                    }
                })
                .catch((error) => {
                    showMessage(`Could not reach server. Is the backend running on ${API_BASE_URL}?`, 'error');
                    console.error('Fetch error:', error);
                })
                .finally(() => {
                    if (loginBtn) {
                        loginBtn.disabled = false;
                        loginBtn.textContent = originalBtnText;
                    }
                });
        });
    }

    // ============================================
    // Forgot Password Link
    // ============================================
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Redirect to password reset flow here.');
            // window.location.href = 'forgot-password.html';
        });
    }

    // ============================================
    // "Create an account" is now a plain link with
    // its own href, so no click handler is needed.
    // ============================================

});