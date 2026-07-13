function togglePassword(id, btn) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

const form = document.querySelector('form');
const pinPattern = /^[0-9]{4}$/;
const API_BASE_URL = 'http://localhost:8080'; // apna Spring Boot port yahan check kar lena

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const society = document.getElementById('society').value.trim();
    const flat = document.getElementById('flat').value.trim();

    if (!fullname || !email || !phone || !society || !flat) {
        alert('Kripya saari fields bharein');
        return;
    }

    if (!pinPattern.test(password)) {
        alert('Password exactly 4 digit ka hona chahiye');
        return;
    }

    if (password !== confirmPassword) {
        alert('Password match nahi ho raha');
        return;
    }

    const payload = {
        name: fullname,
        email: email,
        phoneNumber: phone,
        password: password,
        societyName: society,
        flatNumber: flat
    };

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
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
            alert(data);
            form.reset();
        } else {
            alert('Error: ' + data);
        }
    })
    .catch((error) => {
        alert('Network error: server tak nahi pahunch paya. Backend chal raha hai?');
        console.error(error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
});