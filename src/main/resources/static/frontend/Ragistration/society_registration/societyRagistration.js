// password 4 digit or same condition checking

function togglePassword(id, btn) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const passwordHint = document.getElementById('password-hint');
const confirmHint = document.getElementById('confirm-hint');

// Allow only digits, max 4 characters
[passwordInput, confirmInput].forEach(function (input) {
    input.addEventListener('input', function () {
        input.value = input.value.replace(/\D/g, '').slice(0, 4);
        updateHints();
    });

});

function updateHints() {
    const pass = passwordInput.value;
    const confirm = confirmInput.value;

    if (pass.length === 0) {
        passwordHint.textContent = 'Password must be exactly 4 digits';
        passwordHint.className = 'hint-msg';
    } else if (pass.length < 4) {
        passwordHint.textContent = pass.length + '/4 digits entered';
        passwordHint.className = 'hint-msg';
    } else {
        passwordHint.textContent = '4/4 digits entered';
        passwordHint.className = 'hint-msg success';
    }

    if (confirm.length === 0) {
        confirmHint.textContent = '';
        confirmHint.className = 'hint-msg';
    } else if (confirm.length < 4) {
        confirmHint.textContent = confirm.length + '/4 digits entered';
        confirmHint.className = 'hint-msg';
    } else if (pass === confirm) {
        confirmHint.textContent = 'Passwords match';
        confirmHint.className = 'hint-msg success';
    } else {
        confirmHint.textContent = 'Passwords do not match';
        confirmHint.className = 'hint-msg error';
    }
}

// Sign in link placeholder
document.getElementById('signInLink').addEventListener('click', (e) => {
   window.location.href = "../Login_page/loginPage.html"
});

// Show/hide PIN toggles
document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.setAttribute('aria-label', isHidden ? 'Hide PIN' : 'Show PIN');
    });
});

// Basic validation on submit
const form = document.getElementById('registerForm');
const pinPattern = /^[0-9]{4}$/;

// Backend API base URL — change port here if your Spring Boot app runs on a different one
const API_BASE_URL = 'http://localhost:8080';

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const requiredFields = ['societyName','societyAddress','regNumber','adminName','phone','email'];
    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        const field = input.closest('.field');
        if (!input.value.trim()) {
            field.classList.add('invalid');
            valid = false;
        } else {
            field.classList.remove('invalid');
        }
    });

    const emailInput = document.getElementById('email');
    const emailField = emailInput.closest('.field');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() && !emailPattern.test(emailInput.value.trim())) {
        emailField.classList.add('invalid');
        valid = false;
    }

    const pinInput = document.getElementById('password');
    const pinField = pinInput.closest('.field');
    if (!pinPattern.test(pinInput.value)) {
        pinField.classList.add('invalid');
        valid = false;
    } else {
        pinField.classList.remove('invalid');
    }

    const confirmInput = document.getElementById('confirmPassword');
    const confirmField = confirmInput.closest('.field');
    if (!pinPattern.test(confirmInput.value) || confirmInput.value !== pinInput.value) {
        confirmField.classList.add('invalid');
        valid = false;
    } else {
        confirmField.classList.remove('invalid');
    }

    if (!valid) {
        return;
    }

    // Build payload matching RegisterSocietyRequest.java field names exactly
    const payload = {
        societyName: document.getElementById('societyName').value.trim(),
        address: document.getElementById('societyAddress').value.trim(),
        registrationNumber: document.getElementById('regNumber').value.trim(),
        adminName: document.getElementById('adminName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: pinInput.value
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
            alert(data); // "Society aur Admin account successfully create ho gaya"
            form.reset();
            updateHints();
        } else {
            alert('Error: ' + data);
        }
    })
    .catch((error) => {
        alert('Network error: could not reach server. Is the backend running on ' + API_BASE_URL + '?');
        console.error(error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
});