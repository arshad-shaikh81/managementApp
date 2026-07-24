// =====================================================
// ---------- FETCH REAL LOGGED-IN ADMIN'S DATA ----------
// =====================================================
const API_BASE_URL = 'https://managementapp-38ex.onrender.com';

// Default avatar image shown when the admin hasn't uploaded a profile photo yet.
const DEFAULT_AVATAR_IMG = '<img src="../../images/avatar.png" alt="Default Avatar">';

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

            // Saved profile photo dikhao (agar pehle se database me hai), warna default
            if (data.avatar) {
                renderAvatarImage(data.avatar);
            } else {
                resetAvatarToDefault(false); // false = don't mark this as a pending change
            }

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
function performLogout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
}
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        performLogout();
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
        performLogout();
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
const avatarResetBtn = document.getElementById('avatarResetBtn');
const mainAvatar = document.getElementById('mainAvatar');
const topbarAvatar = document.getElementById('topbarAvatar');

// Newly selected photo (base64 data-URL) waiting to be sent on "Save changes".
// Stays null until user picks a file or resets; backend leaves the photo
// untouched if this is null. Set to the string 'DEFAULT' when the user
// resets back to the default logo, so the save handler knows to clear it.
let selectedAvatarBase64 = null;

// Show a photo (base64 data-URL) on both avatar circles
function renderAvatarImage(imageUrl) {
    if (!imageUrl) return;
    const imgTag = `<img src="${imageUrl}" alt="Profile Photo" onerror="this.onerror=null;this.src='../../images/avatar.png';this.alt='Default Avatar';">`;
    if (mainAvatar) {
        mainAvatar.innerHTML = imgTag;
        mainAvatar.style.padding = '0';
    }
    if (topbarAvatar) {
        topbarAvatar.innerHTML = imgTag;
        topbarAvatar.style.padding = '0';
    }
    updateResetBtnVisibility();
}

// Show/hide the "Set default" pill button — only visible when a real photo is set
function updateResetBtnVisibility() {
    if (!avatarResetBtn) return;
    const hasPhoto = mainAvatar && mainAvatar.querySelector('img');
    avatarResetBtn.style.display = hasPhoto ? 'flex' : 'none';
}

// Put both avatar circles back to the default Management Hub logo.
// markAsChange (default true) controls whether this counts as a pending
// change to be saved to the backend on next "Save changes" click.
function resetAvatarToDefault(markAsChange) {
    if (markAsChange === undefined) markAsChange = true;

    if (mainAvatar) {
        mainAvatar.innerHTML = DEFAULT_AVATAR_IMG;
        mainAvatar.style.padding = '0';
    }
    if (topbarAvatar) {
        topbarAvatar.innerHTML = DEFAULT_AVATAR_IMG;
        topbarAvatar.style.padding = '0';
    }

    if (markAsChange) {
        selectedAvatarBase64 = 'DEFAULT';
    }

    updateResetBtnVisibility();
}

if (avatarResetBtn) {
    avatarResetBtn.addEventListener('click', function () {
        resetAvatarToDefault(true);
    });
}

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

// Update initials on both avatar circles if no photo AND no default logo is set
function updateAvatarInitials(name) {
    const initials = getAvatarInitials(name);
    if (mainAvatar && !mainAvatar.querySelector('img') && !mainAvatar.querySelector('svg')) {
        mainAvatar.innerText = initials;
    }
    if (topbarAvatar && !topbarAvatar.querySelector('img') && !topbarAvatar.querySelector('svg')) {
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

// =====================================================
// ---------- TOAST (chota nice popup, alert() ki jagah) ----------
// =====================================================
function showToast(message, type) {
    let toast = document.getElementById('profileToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'profileToast';
        document.body.appendChild(toast);
    }
    toast.className = 'profile-toast ' + (type === 'error' ? 'profile-toast-error' : 'profile-toast-success');
    toast.textContent = message;

    // Reflow taaki animation dobara trigger ho har baar
    void toast.offsetWidth;
    toast.classList.add('show');

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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

        if (!isPhoneValid || !isEmailValid) return;

        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
            return;
        }

        const saveBtn = profileForm.querySelector('button[type="submit"]');
        const originalBtnText = saveBtn ? saveBtn.innerText : '';
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerText = 'Saving...';
        }

        const homeNoInput = document.getElementById('homeNo');
        const addressInput = document.getElementById('address');

        // 'DEFAULT' tells the backend to clear the stored avatar (set it to
        // null/empty) instead of trying to save it as an image string.
        const avatarPayloadValue = (selectedAvatarBase64 === 'DEFAULT') ? null : selectedAvatarBase64;

        const payload = {
            name: fullNameInput ? fullNameInput.value.trim() : '',
            flatNumber: homeNoInput ? homeNoInput.value.trim() : '',
            address: addressInput ? addressInput.value.trim() : '',
            avatar: avatarPayloadValue, // null jab tak koi nayi photo select nahi ki, backend isko ignore karega
            clearAvatar: selectedAvatarBase64 === 'DEFAULT' // explicit flag for backend to remove saved avatar
        };

        fetch(API_BASE_URL + '/api/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        })
            .then(async (response) => {
                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    const errMsg = (data && typeof data === 'string') ? data : 'Could not save changes. Please try again.';
                    showToast(errMsg, 'error');
                    return;
                }

                // Backend se aaya saved data se form/header sync karo
                if (fullNameInput && data.name !== undefined) fullNameInput.value = data.name || '';
                if (homeNoInput && data.flatNumber !== undefined) homeNoInput.value = data.flatNumber || '';
                if (addressInput && data.societyAddress !== undefined) addressInput.value = data.societyAddress || '';

                syncProfileName(data.name || '');
                syncProfileEmail(data.email || '');

                // Dashboard's instant-paint cache reads from localStorage —
                // keep it in sync so it doesn't show the old name/email
                // until the next fresh API fetch happens.
                if (data.name) localStorage.setItem('name', data.name);
                if (data.email) localStorage.setItem('email', data.email);

                if (data.avatar) {
                    renderAvatarImage(data.avatar);
                } else {
                    // Avatar cleared (reset flow) — show default logo, hide reset button
                    resetAvatarToDefault(false);
                }

                selectedAvatarBase64 = null; // already saved, ab tak ka "pending" upload clear karo

                showToast('Profile details saved successfully!', 'success');
            })
            .catch((error) => {
                console.error('Profile save failed:', error);
                showToast('Network error. Please check your connection and try again.', 'error');
            })
            .finally(() => {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerText = originalBtnText;
                }
            });
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
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const rawImageUrl = event.target.result;

            // Photo ko chhota kar do (max 300x300) taaki upload fast ho aur
            // database me bohot bada base64 store na ho
            const img = new Image();
            img.onload = function () {
                const maxSize = 300;
                let { width, height } = img;
                if (width > height && width > maxSize) {
                    height = Math.round(height * (maxSize / width));
                    width = maxSize;
                } else if (height > maxSize) {
                    width = Math.round(width * (maxSize / height));
                    height = maxSize;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);

                // Turant preview dikhao
                renderAvatarImage(compressedUrl);

                // Save changes dabane par yehi backend ko jayega
                selectedAvatarBase64 = compressedUrl;
            };
            img.onerror = function () {
                // Resize fail ho jaye toh bhi original hi use kar lo
                renderAvatarImage(rawImageUrl);
                selectedAvatarBase64 = rawImageUrl;
            };
            img.src = rawImageUrl;
        };
        reader.readAsDataURL(file);
    });
}