const passwordInput = document.getElementById('password');
const toggleEye = document.getElementById('toggleEye');
const eyeIcon = document.getElementById('eyeIcon');
const signIn = document.getElementById('signInBtn');

// Allow only digits, max 4 characters
passwordInput.addEventListener('input', function () {
    passwordInput.value = passwordInput.value.replace(/\D/g, '').slice(0, 4);
});

toggleEye.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleEye.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');

    // Swap icon between "eye" and "eye-off"
    eyeIcon.innerHTML = isHidden
        ? `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.94 20.94 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.9 20.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
         <line x1="1" y1="1" x2="23" y2="23"></line>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
         <circle cx="12" cy="12" r="3"></circle>`;
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const mobile = document.getElementById('mobile').value.trim();
    const password = passwordInput.value;

    if (!mobile || !password) {
        alert('Please fill in both fields.');
        return;
    }

    if (!/^\d{4}$/.test(password)) {
        alert('Password must be exactly 4 digits.');
        return;
    }

    alert('Login submitted!\n(Connect this to your backend to authenticate.)');
});

document.getElementById('forgotLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirect to password reset flow here.');
});

function openPage(){
    window.location.href = "../Signin_page/signinPage.html";
}

signIn.addEventListener('click' , () => {
   openPage();
});