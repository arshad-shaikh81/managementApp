```
```
    // authGuard.js
    //
    // Har protected page (dashboard, profile, etc.) ke <head> me sabse pehle
    // include karo. Agar token nahi hai ya invalid/expired hai, turant login
    // page pe bhej dega. Iske bina koi bhi seedha dashboard URL type karke
    // bina login kiye andar ghus sakta tha.
    //
    // Usage (page ke <head> me, baaki scripts se PEHLE):
    //   <script src="../../authGuard.js"></script>
    //
    // Path apne actual folder structure ke hisaab se adjust karna —
    // ye file jahan bhi rakho, LOGIN_PAGE_PATH neeche sahi karke set karo.

    (function () {
        const API_BASE_URL = 'https://managementapp-38ex.onrender.com';

        // TODO: apna actual login page ka relative path yahan set karo
        const LOGIN_PAGE_PATH = '../../LoginPage/loginPage.html';

        const token = sessionStorage.getItem('token');

        function clearSessionAndRedirect() {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            sessionStorage.removeItem('name');
            sessionStorage.removeItem('email');
            window.location.href = LOGIN_PAGE_PATH;
        }

        if (!token) {
            clearSessionAndRedirect();
            return;
        }

        fetch(API_BASE_URL + '/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(res => {
            if (!res.ok) {
                clearSessionAndRedirect();
            }
            // res.ok hai toh kuch mat karo — page normally load hone do
        }).catch(() => {
            // Network fail (server sleep se wake ho raha ho sakta hai) —
            // turant logout mat karo, warna sirf slow server ki wajah se
            // valid user bhi login page pe bounce ho jayega.
        });
    })();
```
```