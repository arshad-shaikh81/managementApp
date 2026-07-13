// Wait for DOM to fully load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM Elements =====
    const passwordInput = document.getElementById('password');
    const toggleEye = document.getElementById('toggleEye');
    const eyeIcon = document.getElementById('eyeIcon');
    const signInBtn = document.getElementById('signInBtn');
    const loginForm = document.getElementById('loginForm');
    const forgotLink = document.getElementById('forgotLink');
    const passwordHint = document.getElementById('password-hint');

    // ===== Debug: Check if elements loaded =====
    if (!passwordInput || !toggleEye || !eyeIcon || !passwordHint) {
        console.error('❌ One or more elements not found! Check your HTML IDs.');
        return;
    }

    // ============================================
    // 🔢 Password Input: Digits only + Counter Hint
    // ============================================
    passwordInput.addEventListener('input', function () {
        // Allow only numbers, max 4 digits
        this.value = this.value.replace(/\D/g, '').slice(0, 4);

        // Update hint based on length
        if (passwordHint) {
            if (this.value.length === 0) {
                passwordHint.textContent = "Password must be exactly 4 digits";
                passwordHint.className = "hint-msg";
            } else if (this.value.length < 4) {
                passwordHint.textContent = `${this.value.length}/4 digits entered`;
                passwordHint.className = "hint-msg";
            } else {
                passwordHint.textContent = "✓ Valid Password";
                passwordHint.className = "hint-msg success";
            }
        }
    });

    // ============================================
    // 👁️ Toggle Password Visibility (Eye Icon)
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
    // 📝 Form Submission Handler
    // ============================================
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const mobile = document.getElementById('mobile')?.value.trim();
            const password = passwordInput.value;

            // Validation
            if (!mobile || !password) {
                alert('Please fill in both fields.');
                return;
            }

            if (!/^\d{4}$/.test(password)) {
                if (passwordHint) {
                    passwordHint.textContent = "⚠ Password must be exactly 4 digits";
                    passwordHint.className = "hint-msg error";
                }
                return;
            }

            // Success
            alert('Login submitted!\n(Connect this to your backend to authenticate.)');
            // Redirect example: window.location.href = 'dashboard.html';
        });
    }

    // ============================================
    // 🔗 Forgot Password Link
    // ============================================
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Redirect to password reset flow here.');
            // window.location.href = 'forgot-password.html';
        });
    }

    // ============================================
    // ➡️ Sign In Button (Go to Signup Page)
    // ============================================
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            window.location.href = "../Signin_page/signinPage.html";
        });
    }

});