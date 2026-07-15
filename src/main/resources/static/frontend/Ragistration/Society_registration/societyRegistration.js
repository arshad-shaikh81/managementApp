document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');
    const form = document.getElementById('registerForm');
    const API_BASE_URL = 'http://localhost:8080';

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

            // Swap SVG icon paths
            if (isHidden) {
                // Eye-Off (Crossed out)
                svg.innerHTML = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.94 20.94 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.9 20.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
            } else {
                // Eye (Normal)
                svg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
            }
        });
    });

    // ===== 3. Sign In Link Redirect =====
    const signInLink = document.getElementById('signInLink');
    if (signInLink) {
        signInLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "../Login_page/loginPage.html";
        });
    }

    // ===== 4. Form Submission & Validation =====
    const pinPattern = /^[0-9]{4}$/;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        // Clear previous invalid states
        document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));

        // Check required fields
        const requiredFields = ['societyName', 'societyAddress', 'regNumber', 'adminName', 'phone', 'email'];
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            const field = input.closest('.field');
            if (!input.value.trim()) {
                field.classList.add('invalid');
                valid = false;
            }
        });

        // Email validation
        const emailInput = document.getElementById('email');
        const emailField = emailInput.closest('.field');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() && !emailPattern.test(emailInput.value.trim())) {
            emailField.classList.add('invalid');
            valid = false;
        }

        // Password validation
        const pinField = passwordInput.closest('.field');
        if (!pinPattern.test(passwordInput.value)) {
            pinField.classList.add('invalid');
            passwordHint.textContent = 'Password must be exactly 4 digits';
            passwordHint.className = 'hint-msg error';
            valid = false;
        }

        // Confirm Password validation
        const confirmField = confirmInput.closest('.field');
        if (!pinPattern.test(confirmInput.value) || confirmInput.value !== passwordInput.value) {
            confirmField.classList.add('invalid');
            confirmHint.textContent = 'Passwords do not match';
            confirmHint.className = 'hint-msg error';
            valid = false;
        }

        if (!valid) {
            return; // Stop submission if invalid
        }

        // Build payload
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

        // Loading state
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
                    alert(data || 'Society aur Admin account successfully create ho gaya!');
                    form.reset();
                    updateHints(); // Reset hints to default
                } else {
                    alert('Error: ' + data);
                }
            })
            .catch((error) => {
                alert('Network error: could not reach server. Is the backend running on ' + API_BASE_URL + '?');
                console.error('Fetch error:', error);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
    });
});