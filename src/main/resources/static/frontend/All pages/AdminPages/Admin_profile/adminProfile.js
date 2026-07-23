// =====================================================
// ---------- FETCH REAL LOGGED-IN ADMIN'S DATA ----------
// =====================================================
const API_BASE_URL = 'https://managementapp-38ex.onrender.com';

function loadRealProfile() {
    const token = localStorage.getItem('token');

    // No session -> back to login
    if (!token) {
        window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
        return;
    }

    fetch(API_BASE_URL + '/api/auth/me', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                // Token invalid/expired -> session khatam, dobara login karo
                localStorage.clear();
                window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
                return;
            }

            // Form fields ko real data se bharo
            const fullNameEl = document.getElementById('fullName');
            const phoneEl = document.getElementById('phone');
            const homeNoEl = document.getElementById('homeNo');
            const emailEl = document.getElementById('email');
            const addressEl = document.getElementById('address');
            const greetingEl = document.getElementById('greetingText');

            if (fullNameEl) fullNameEl.value = data.name || '';
            if (phoneEl) phoneEl.value = data.phone || '';
            if (homeNoEl) homeNoEl.value = data.flatNumber || '';
            if (emailEl) emailEl.value = data.email || '';
            if (addressEl) addressEl.value = data.societyAddress || '';

            // Header / topbar / avatar ko naam-email ke saath sync karo
            syncProfileName(data.name || '');
            syncProfileEmail(data.email || '');

            if (greetingEl) {
                const hour = new Date().getHours();
                let greet = "Good evening";
                if (hour < 12) greet = "Good morning";
                else if (hour < 17) greet = "Good afternoon";
                const firstName = (data.name || '').trim().split(/\s+/)[0] || '';
                greetingEl.innerHTML = `${greet}, ${firstName} <span class="wave-emoji">👋</span>`;
            }
        })
        .catch((error) => {
            console.error('Could not load profile:', error);
        });
}

// =====================================================
// ---------- MOBILE SIDEBAR (HAMBURGER DRAWER) ----------
// =====================================================
const sidebar = document.getElementById('sidebar');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('show');
}

function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('show');
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sidebar && sidebar.classList.contains('open')) closeSidebar();
        else openSidebar();
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

// =====================================================
// ---------- SIDEBAR NAVIGATION ----------
// =====================================================
const navEl = document.getElementById('nav');
if (navEl) {
    navEl.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Real navigation link — fade out, then navigate
        if (href !== '#') {
            e.preventDefault();
            closeSidebar();
            document.body.classList.add('page-fade-out');
            setTimeout(() => {
                window.location.href = href;
            }, 280);
            return;
        }

        // Placeholder link — just toggle active state
        e.preventDefault();
        document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        closeSidebar();
    });
}

// =====================================================
// ---------- LOGOUT (SIDEBAR BUTTON) ----------
// =====================================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
    });
}

// =====================================================
// ---------- BELL & USER DROPDOWNS ----------
// =====================================================
const bellBtn = document.getElementById('bellBtn');
const notifDropdown = document.getElementById('notifDropdown');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

function closeDropdowns(except) {
    if (except !== notifDropdown && notifDropdown) notifDropdown.classList.remove('show');
    if (except !== userDropdown && userDropdown) userDropdown.classList.remove('show');
}

if (bellBtn) {
    bellBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const willShow = notifDropdown && !notifDropdown.classList.contains('show');
        closeDropdowns();
        if (willShow && notifDropdown) notifDropdown.classList.add('show');
    });
}

if (userBtn) {
    userBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const willShow = userDropdown && !userDropdown.classList.contains('show');
        closeDropdowns();
        if (willShow && userDropdown) userDropdown.classList.add('show');
    });
}

const dropdownLogout = document.getElementById('dropdownLogout');
if (dropdownLogout) {
    dropdownLogout.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
    });
}

document.addEventListener('click', function () {
    closeDropdowns();
});

// =====================================================
// ---------- PROFILE LIVE UPDATES & AVATAR HANDLER ----------
// =====================================================
const avatarCamBtn = document.getElementById('avatarCamBtn');
const avatarInput = document.getElementById('avatarInput');
const mainAvatar = document.getElementById('mainAvatar');
const topbarAvatar = document.getElementById('topbarAvatar');

// Form input elements
const fullNameInput = document.getElementById('fullName');
const profileDisplayName = document.getElementById('profileDisplayName');
const topbarUserName = document.getElementById('topbarUserName');

const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');

const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const profileDisplayEmail = document.getElementById('profileDisplayEmail');
const topbarUserEmail = document.getElementById('topbarUserEmail');

// Generate initials (e.g. "shaikh arshad" -> "SA")
function getAvatarInitials(name) {
    if (!name || name.trim() === '') return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Update initials on both avatar circles if no photo is set
function updateAvatarInitials(name) {
    const initials = getAvatarInitials(name);
    if (mainAvatar && !mainAvatar.querySelector('img')) {
        mainAvatar.innerText = initials;
    }
    if (topbarAvatar && !topbarAvatar.querySelector('img')) {
        topbarAvatar.innerText = initials;
    }
}

// Master name sync
function syncProfileName(newName) {
    const displayValue = newName.trim() || 'User Name';
    if (profileDisplayName) profileDisplayName.innerText = displayValue;
    if (topbarUserName) topbarUserName.innerText = displayValue;
    updateAvatarInitials(newName);
}

// Master email sync
function syncProfileEmail(newEmail) {
    const displayValue = newEmail.trim() || 'email@example.com';
    if (profileDisplayEmail) profileDisplayEmail.innerText = displayValue;
    if (topbarUserEmail) topbarUserEmail.innerText = displayValue;
}

// Page load initialization
if (fullNameInput) {
    if (fullNameInput.value) syncProfileName(fullNameInput.value);
    fullNameInput.addEventListener('input', function (e) {
        syncProfileName(e.target.value);
    });
}

if (emailInput) {
    if (emailInput.value) syncProfileEmail(emailInput.value);
    emailInput.addEventListener('input', function (e) {
        syncProfileEmail(e.target.value);
        validateEmail();
    });
}

// Restrict phone input to numbers, max length 10
if (phoneInput) {
    phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        validatePhone();
    });
}

function validatePhone() {
    if (!phoneInput) return true;
    const val = phoneInput.value.trim();
    if (val.length > 0 && val.length !== 10) {
        phoneInput.classList.add('input-error');
        if (phoneError) phoneError.style.display = 'block';
        return false;
    }
    phoneInput.classList.remove('input-error');
    if (phoneError) phoneError.style.display = 'none';
    return true;
}

function validateEmail() {
    if (!emailInput) return true;
    const val = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.length > 0 && !emailPattern.test(val)) {
        emailInput.classList.add('input-error');
        if (emailError) emailError.style.display = 'block';
        return false;
    }
    emailInput.classList.remove('input-error');
    if (emailError) emailError.style.display = 'none';
    return true;
}

// Save changes form submit
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const isPhoneValid = validatePhone();
        const isEmailValid = validateEmail();

        if (phoneInput && phoneInput.value.trim().length === 0) {
            phoneInput.classList.add('input-error');
            if (phoneError) phoneError.style.display = 'block';
            return;
        }

        if (isPhoneValid && isEmailValid) {
            alert('Profile details saved successfully!');
        }
    });
}

// Ab jaake real data load karo (fullNameInput, syncProfileName, syncProfileEmail sab ready hain)
loadRealProfile();

// Handle photo upload
if (avatarCamBtn && avatarInput) {
    avatarCamBtn.addEventListener('click', function () {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageUrl = event.target.result;
                const imgTag = `<img src="${imageUrl}" alt="Profile Photo">`;
                if (mainAvatar) {
                    mainAvatar.innerHTML = imgTag;
                    mainAvatar.style.padding = '0';
                }
                if (topbarAvatar) {
                    topbarAvatar.innerHTML = imgTag;
                    topbarAvatar.style.padding = '0';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}