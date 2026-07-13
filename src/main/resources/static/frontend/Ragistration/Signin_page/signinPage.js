document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');
    const form = document.querySelector('form');
    const API_BASE_URL = 'http://localhost:8080';

    // ===== 1. Password Counter & Validation Logic =====
    function updatePasswordHint() {
        const len = passwordInput.value.length;
        if (len === 0) {
            passwordHint.textContent = "Password must be exactly 4 digits";
            passwordHint.className = "hint-msg";
        } else if (len < 4) {
            passwordHint.textContent = `${len}/4 digits entered`;
            passwordHint.className = "hint-msg";
        } else {
            passwordHint.textContent = "✓ Valid Password";
            passwordHint.className = "hint-msg success";
        }
        // Jab bhi main password change ho, confirm password match bhi re-check karo
        checkMatch();
    }

    function checkMatch() {
        const p1 = passwordInput.value;
        const p2 = confirmPasswordInput.value;

        if (p2.length === 0) {
            confirmHint.textContent = "Confirm your 4-digit PIN";
            confirmHint.className = "hint-msg";
        } else if (p1 === p2 && p1.length === 4) {
            confirmHint.textContent = "✓ Passwords match";
            confirmHint.className = "hint-msg success";
        } else {
            confirmHint.textContent = "⚠ Passwords do not match";
            confirmHint.className = "hint-msg error";
        }
    }

    // Restrict to digits only + max 4 chars + update hints
    passwordInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
        updatePasswordHint();
    });

    confirmPasswordInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
        checkMatch();
    });

    // ===== 2. Toggle Password Visibility (Eye Icon Swap) =====
    // Global function taaki HTML ke onclick="togglePassword(...)" se call ho sake
    window.togglePassword = function (inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';

        // SVG icon ko swap karna
        const svg = btn.querySelector('svg');
        if (svg) {
            if (isHidden) {
                // Eye Off (Crossed out) icon
                svg.innerHTML = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.94 20.94 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.9 20.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
            } else {
                // Eye On (Normal) icon
                svg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>`;
            }
        }
    };

    // ===== 3. Form Submission Logic =====
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const society = document.getElementById('society').value.trim();
        const flat = document.getElementById('flat').value.trim();

        if (!fullname || !email || !phone || !society || !flat) {
            alert('Kripya saari fields bharein');
            return;
        }

        if (password.length !== 4 || !/^\d{4}$/.test(password)) {
            passwordHint.textContent = "⚠ Password must be exactly 4 digits";
            passwordHint.className = "hint-msg error";
            return;
        }

        if (password !== confirmPassword) {
            confirmHint.textContent = "⚠ Passwords do not match";
            confirmHint.className = "hint-msg error";
            return;
        }

        const payload = {
            fullName: fullname,
            email: email,
            phone: phone,
            password: password,
            societyName: society,
            flatNumber: flat
        };

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        fetch(API_BASE_URL + '/api/auth/register-resident', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(async (response) => {
                const data = await response.text();
                if (response.ok) {
                    alert(data || 'Account created successfully!');
                    form.reset();
                    // Reset hints after successful submission
                    passwordHint.textContent = "Password must be exactly 4 digits";
                    passwordHint.className = "hint-msg";
                    confirmHint.textContent = "Confirm your 4-digit PIN";
                    confirmHint.className = "hint-msg";
                } else {
                    alert('Error: ' + data);
                }
            })
            .catch((error) => {
                alert('Network error: server tak nahi pahunch paya. Backend chal raha hai?');
                console.error('Fetch error:', error);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
    });
});