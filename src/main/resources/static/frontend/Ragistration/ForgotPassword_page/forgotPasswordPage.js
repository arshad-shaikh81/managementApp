document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'http://localhost:8080';
    const RESEND_COOLDOWN_SECONDS = 60;

    // ===== DOM Elements =====
    const stepPhone = document.getElementById('step-phone');
    const stepReset = document.getElementById('step-reset');

    const sendOtpForm = document.getElementById('sendOtpForm');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const emailInput = document.getElementById('email');

    const resetForm = document.getElementById('resetForm');
    const resetBtn = document.getElementById('resetBtn');
    const otpInput = document.getElementById('otp');
    const emailDisplay = document.getElementById('emailDisplay');
    const resendLink = document.getElementById('resendLink');

    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordHint = document.getElementById('password-hint');
    const confirmHint = document.getElementById('confirm-hint');

    const toggleEye1 = document.getElementById('toggleEye1');
    const eyeIcon1 = document.getElementById('eyeIcon1');
    const toggleEye2 = document.getElementById('toggleEye2');
    const eyeIcon2 = document.getElementById('eyeIcon2');

    const formMessage = document.getElementById('form-message');
    const alertIcon = document.getElementById('alert-icon');
    const alertText = document.getElementById('alert-text');

    let currentEmail = '';
    let resendTimer = null;

    // ============================================
    // Alert banner helper
    // ============================================
    const ICONS = {
        success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
        error: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
    };

    function showMessage(text, type) {
        formMessage.className = 'alert-banner ' + type;
        formMessage.hidden = false;
        alertIcon.innerHTML = ICONS[type] || ICONS.error;
        alertText.textContent = text;
    }

    function hideMessage() {
        formMessage.hidden = true;
    }

    // ============================================
    // Digit-only inputs
    // ============================================
    function digitsOnly(input, maxLen) {
        input.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, maxLen);
        });
    }
    digitsOnly(otpInput, 6);
    digitsOnly(newPasswordInput, 4);
    digitsOnly(confirmPasswordInput, 4);

    // ============================================
    // Password visibility toggles
    // ============================================
    function wireToggle(button, input, icon) {
        button.addEventListener('click', () => {
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        });
    }
    wireToggle(toggleEye1, newPasswordInput, eyeIcon1);
    wireToggle(toggleEye2, confirmPasswordInput, eyeIcon2);

    // ============================================
    // Resend OTP cooldown
    // ============================================
    function startResendCooldown() {
        let remaining = RESEND_COOLDOWN_SECONDS;
        resendLink.classList.add('disabled');
        resendLink.textContent = `Resend OTP (${remaining}s)`;

        clearInterval(resendTimer);
        resendTimer = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(resendTimer);
                resendLink.classList.remove('disabled');
                resendLink.textContent = 'Resend OTP';
            } else {
                resendLink.textContent = `Resend OTP (${remaining}s)`;
            }
        }, 1000);
    }

    // ============================================
    // STEP 1: Send OTP
    // ============================================
    function requestOtp(email) {
        return fetch(API_BASE_URL + '/api/auth/forgot-password/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).then(async (res) => {
            const text = await res.text();
            if (!res.ok) throw new Error(text || 'Could not send OTP');
            return text;
        });
    }

    sendOtpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideMessage();

        const email = emailInput.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        sendOtpBtn.disabled = true;
        const originalText = sendOtpBtn.textContent;
        sendOtpBtn.textContent = 'Sending...';

        requestOtp(email)
            .then(() => {
                currentEmail = email;
                emailDisplay.textContent = email;
                stepPhone.hidden = true;
                stepReset.hidden = false;
                startResendCooldown();
                showMessage('OTP sent successfully. Please check your inbox.', 'success');
            })
            .catch((err) => {
                showMessage(err.message || 'Could not reach server. Is the backend running?', 'error');
            })
            .finally(() => {
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = originalText;
            });
    });

    // ============================================
    // Resend OTP link
    // ============================================
    resendLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (resendLink.classList.contains('disabled')) return;

        hideMessage();
        requestOtp(currentEmail)
            .then(() => {
                startResendCooldown();
                showMessage('A new OTP has been sent.', 'success');
            })
            .catch((err) => {
                showMessage(err.message || 'Could not resend OTP', 'error');
            });
    });

    // ============================================
    // STEP 2: Verify OTP + Reset Password
    // ============================================
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideMessage();

        const otp = otpInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (otp.length !== 6) {
            showMessage('Please enter the 6-digit OTP', 'error');
            return;
        }
        if (!/^\d{4}$/.test(newPassword)) {
            passwordHint.textContent = 'Password must be exactly 4 digits';
            passwordHint.className = 'hint-msg error';
            return;
        }
        if (newPassword !== confirmPassword) {
            confirmHint.textContent = 'Passwords do not match';
            confirmHint.className = 'hint-msg error';
            return;
        }
        passwordHint.className = 'hint-msg';
        confirmHint.className = 'hint-msg';

        resetBtn.disabled = true;
        const originalText = resetBtn.textContent;
        resetBtn.textContent = 'Resetting...';

        fetch(API_BASE_URL + '/api/auth/forgot-password/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp, newPassword })
        })
            .then(async (res) => {
                const text = await res.text();
                if (!res.ok) throw new Error(text || 'Could not reset password');
                return text;
            })
            .then(() => {
                showMessage('Password reset successfully! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = '../Login_page/loginPage.html';
                }, 1500);
            })
            .catch((err) => {
                showMessage(err.message || 'Could not reach server. Is the backend running?', 'error');
            })
            .finally(() => {
                resetBtn.disabled = false;
                resetBtn.textContent = originalText;
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
        spawnParticles('forgotParticles', narrow ? 14 : 24, [
            'rgba(59,130,246,0.55)', 'rgba(37,99,235,0.5)', 'rgba(14,165,233,0.45)'
        ]);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();