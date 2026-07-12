function togglePassword(id, btn) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
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

// Validate on form submit
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();   // hamesha sabse pehle, page reload rokne ke liye

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

    // Sab sahi hai — account create ho gaya (abhi backend nahi hai, isliye direct redirect)
    alert('Account created successfully!');
    window.location.href = "../Login_page/loginPage.html";
});