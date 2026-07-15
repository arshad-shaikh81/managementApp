document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM Elements =====
    const form = document.querySelector('form');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');
    const toggleButtons = document.querySelectorAll('.toggle-eye');

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
    const API_BASE_URL = 'http://localhost:8080';
    const submitBtn = document.querySelector('.submit-btn');
    const societyHint = document.getElementById('society-hint');
    const formMessage = document.getElementById('form-message');

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
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                });
        });
    }

    // ============================================
    // Footer links ("Register your society" / "Log in")
    // No JS needed -- each <a href="..."> already
    // navigates to its own correct page normally.
    // ============================================

});