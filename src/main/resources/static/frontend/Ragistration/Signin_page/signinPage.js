function togglePassword(id, btn) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const passwordHint = document.getElementById('password-hint');
const confirmHint = document.getElementById('confirm-hint');

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

document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const pass = passwordInput.value;
    const confirm = confirmInput.value;

    if (!/^\d{4}$/.test(pass)) {
        alert('Password must be exactly 4 digits.');
        return;
    }
    if (pass !== confirm) {
        alert('Passwords do not match.');
        return;
    }

    const data = {
        societyName: document.getElementById('society').value.trim(),
        address: "N/A",
        registrationNumber: "TEMP-" + Date.now(),
        adminName: document.getElementById('fullname').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: pass
    };

    fetch('http://localhost:8080/api/auth/register-society', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.text().then(result => ({ status: response.status, body: result })))
    .then(({ status, body }) => {
        if (status === 200) {
            alert('Account created successfully!');
            window.location.href = "../Login_page/loginPage.html";
        } else {
            alert(body);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Something went wrong. Check if backend is running.');
    });
});

// "Log in" link click karne par Login page pe navigate karo
document.getElementById('loginLink').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = "../Login_page/loginPage.html";
});