// ---------- Populate logged-in admin's info ----------
(function populateAdminInfo(){
    // Instant paint from localStorage (fast, no flash of "Loading...") —
    // this gets overwritten below with fresh data from the backend, which
    // is the source of truth (localStorage goes stale after profile edits).
    const cachedName = localStorage.getItem('name') || 'Admin';
    const cachedEmail = localStorage.getItem('email') || '';

    const avatarEl = document.querySelector('#userBtn .avatar');
    const unameEl = document.querySelector('#userBtn .uname');
    const dropdownEmailEl = document.querySelector('.dropdown-email');

    if (avatarEl) {
        avatarEl.innerHTML = '<img src="../../images/avatar.png" alt="Default Avatar">';
        avatarEl.style.padding = '0';
    }
    if (unameEl) unameEl.textContent = cachedName;
    if (dropdownEmailEl && cachedEmail) dropdownEmailEl.textContent = cachedEmail;

    // Expose the first name for the greeting below (updated again once fresh data arrives)
    window.__loggedInFirstName = cachedName.trim().split(/\s+/)[0] || cachedName;

    // Fetch the real, up-to-date profile from the backend — this is what
    // actually drives the name/email/avatar shown, so edits made on the
    // Profile page show up here immediately instead of the stale login-time cache.
    const token = localStorage.getItem('token');
    if (token) {
        fetch('https://managementapp-38ex.onrender.com/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data) return;

                const freshName = data.name || cachedName;
                const freshEmail = data.email || cachedEmail;

                if (unameEl) unameEl.textContent = freshName;
                if (dropdownEmailEl && freshEmail) dropdownEmailEl.textContent = freshEmail;

                // Keep localStorage in sync too, so the cache isn't stale next load
                localStorage.setItem('name', freshName);
                if (freshEmail) localStorage.setItem('email', freshEmail);

                if (avatarEl) {
                    avatarEl.innerHTML = data.avatar
                        ? `<img src="${data.avatar}" alt="Profile Photo">`
                        : '<img src="../../images/avatar.png" alt="Default Avatar">';
                    avatarEl.style.padding = '0';
                }

                window.__loggedInFirstName = freshName.trim().split(/\s+/)[0] || freshName;
                refreshGreeting();
            })
            .catch(() => { /* cached fallback already shown, no big deal */ });
    }
})();

// ---------- Greeting based on time of day ----------
function refreshGreeting(){
    const hour = new Date().getHours();
    let greet = "Good evening";
    if (hour < 12) greet = "Good morning";
    else if (hour < 17) greet = "Good afternoon";
    const firstName = window.__loggedInFirstName || 'Admin';
    document.getElementById('greetingText').innerHTML = `${greet}, ${firstName} <span class="wave-emoji">👋</span>`;
}
refreshGreeting();

// ---------- Mobile sidebar (hamburger) ----------
const sidebar = document.getElementById('sidebar');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar(){
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
}
function closeSidebar(){
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
}

hamburgerBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
});

sidebarOverlay.addEventListener('click', closeSidebar);

// ---------- Sidebar nav active state ----------
document.getElementById('nav').addEventListener('click', function(e){
    const link = e.target.closest('a');
    if(!link) return;

    const href = link.getAttribute('href');

    // Real navigation link (like Profile) — animate then navigate
    if (href && href !== '#') {
        e.preventDefault();
        document.body.classList.add('page-fade-out');
        closeSidebar();
        setTimeout(() => {
            window.location.href = href;
        }, 300); // matches CSS transition duration
        return;
    }

    e.preventDefault();
    document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    closeSidebar();
});
function performLogout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    window.location.href = "../../RagistrationPages/Login_page/loginPage.html";
}
document.getElementById('logoutBtn').addEventListener('click', function(){
    performLogout();
});


// ---------- Bell & User dropdowns ----------
const bellBtn = document.getElementById('bellBtn');
const notifDropdown = document.getElementById('notifDropdown');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

function closeDropdowns(except){
    if (except !== notifDropdown) notifDropdown.classList.remove('show');
    if (except !== userDropdown) userDropdown.classList.remove('show');
}

bellBtn.addEventListener('click', function(e){
    e.stopPropagation();
    const willShow = !notifDropdown.classList.contains('show');
    closeDropdowns();
    if (willShow) notifDropdown.classList.add('show');
});

userBtn.addEventListener('click', function(e){
    e.stopPropagation();
    const willShow = !userDropdown.classList.contains('show');
    closeDropdowns();
    if (willShow) userDropdown.classList.add('show');
});

document.getElementById('dropdownLogout').addEventListener('click', function(e){
    e.preventDefault();
    performLogout();
});

document.addEventListener('click', function(){
    closeDropdowns();
});

// =====================================================
// ---------- REAL DATA SOURCE (single source of truth)
// =====================================================
const allMembers = [
    { name: 'Rajesh Sharma',  role: 'Chartered Accountant', flatNo: 'A-101' },
    { name: 'Priya Menon',    role: 'Software Engineer',    flatNo: 'A-204' },
    { name: 'Amit Patel',     role: 'Business Owner',       flatNo: 'B-302' },
    { name: 'Sneha Kulkarni', role: 'Doctor',                flatNo: 'B-105' },
    { name: 'Vikram Singh',   role: 'Bank Manager',          flatNo: 'C-401' },
    { name: 'Divya Krishnan', role: 'Marketing Manager',     flatNo: 'C-304' },
    { name: 'Karan Mehta',    role: 'Architect',             flatNo: 'A-108' },
    { name: 'Neha Verma',     role: 'Teacher',               flatNo: 'B-205' },
    { name: 'Sanjay Gupta',   role: 'Retired',               flatNo: 'C-301' },
    { name: 'Arjun Reddy',    role: 'Product Manager',       flatNo: 'B-201' },
    { name: 'Fatima Sheikh',  role: 'Lawyer',                flatNo: 'A-401' },
    { name: 'Rohan Desai',    role: 'Consultant',            flatNo: 'C-107' }
];

const complaintsData = [
    { title: 'Unauthorized parking in my slot', status: 'Pending' },
    { title: 'Lift not working — Wing B',        status: 'Pending' },
    { title: 'Streetlight repair needed',        status: 'In Progress' },
    { title: 'Corridor light not working',       status: 'In Progress' },
    { title: 'Garden maintenance',               status: 'Resolved' },
    { title: 'Intercom issue — Flat 302',        status: 'Resolved' },
    { title: 'Noise complaint — Wing C',         status: 'Closed' }
];

const allNotices = [
    { title: 'Water Supply Interruption — Tank Cleaning', tag: 'Maintenance', pinned: true,  postedAgo: '10d ago' },
    { title: 'Annual General Meeting — 28th July',         tag: 'General',     pinned: true,  postedAgo: '13d ago' },
    { title: 'Fire Drill & Safety Audit',                   tag: 'Emergency',   pinned: false, postedAgo: '9d ago' },
    { title: 'Ganesh Chaturthi Celebrations',                tag: 'Festival',    pinned: false, postedAgo: '16d ago' },
    { title: 'Lift B Maintenance Schedule',                  tag: 'Maintenance', pinned: false, postedAgo: '20d ago' },
    { title: 'Parking Slot Reallocation Notice',             tag: 'General',     pinned: false, postedAgo: '22d ago' }
];

const activities = [
    { type: 'member',    text: 'New member <b>Divya Krishnan</b> added to Wing C, Flat 304', time: '8d ago' },
    { type: 'complaint', text: 'Complaint "Unauthorized parking in my slot" raised by <b>Amit Patel</b>', time: '9d ago' },
    { type: 'notice',    text: 'Notice "Fire Drill & Safety Audit" published', time: '9d ago' },
    { type: 'notice',    text: 'Notice "Water Supply Interruption" pinned by admin', time: '10d ago' },
    { type: 'payment',   text: 'Maintenance payment of ₹2,500 received from <b>Rajesh Sharma</b>', time: '10d ago' },
    { type: 'complaint', text: 'Complaint "Corridor light not working" marked as resolved', time: '11d ago' },
    { type: 'payment',   text: 'Maintenance payment of ₹2,500 received from <b>Priya Menon</b>', time: '11d ago' },
    { type: 'member',    text: 'Member profile updated for <b>Arjun Reddy</b> (B-201)', time: '12d ago' }
];

const activityIcons = {
    member: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>',
    complaint: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    notice: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    payment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
};

const pinIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30  " viewBox="0 4 19 19" fill="none"><path d="M8 5H16C16 7 15 8.5 13.5 9.5V12L16 15H8L10.5 12V9.5C9 8.5 8 7 8 5Z" stroke="#4F7EFF" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><path d="M12 15V20" stroke="#4F7EFF" stroke-width="1.8" stroke-linecap="round"/></svg>';

const chartData = [
    { month: 'Feb', billed: 0,     collected: 0 },
    { month: 'Mar', billed: 0,     collected: 0 },
    { month: 'Apr', billed: 0,     collected: 0 },
    { month: 'May', billed: 30000, collected: 28000 },
    { month: 'Jun', billed: 28000, collected: 25000 },
    { month: 'Jul', billed: 30000, collected: 15000 }
];

// =====================================================
// ---------- STAT CARDS (computed from real data)
// =====================================================
const pendingComplaintsCount = complaintsData.filter(c => c.status === 'Pending').length;
const latestCollectedMonth = [...chartData].reverse().find(d => d.collected > 0);

document.getElementById('statMembersValue').textContent = allMembers.length;
document.getElementById('statComplaintsValue').textContent = pendingComplaintsCount;
document.getElementById('statNoticesValue').textContent = allNotices.length + (allNotices.length > 5 ? '+' : '');
document.getElementById('statCollectionValue').textContent = '₹' + latestCollectedMonth.collected.toLocaleString('en-IN');

document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.animationDelay = (i * 0.09) + 's';
});

// =====================================================
// ---------- COMPLAINT STATUS DONUT (real data + hover)
// =====================================================
const statusOrder = ['Pending', 'In Progress', 'Resolved', 'Closed'];
const statusColors = {
    'Pending':     '#e2a13b',
    'In Progress': '#3fa0e8',
    'Resolved':    '#38b06a',
    'Closed':      '#8a8f98'
};
const legendColorClass = {
    'Pending':'orange', 'In Progress':'blue', 'Resolved':'green', 'Closed':'gray'
};

const statusCounts = statusOrder
    .map(status => ({ status, count: complaintsData.filter(c => c.status === status).length }))
    .filter(s => s.count > 0);
const totalComplaints = statusCounts.reduce((sum, s) => sum + s.count, 0);

const R = 80, CX = 100, CY = 100, GAP = 0;
const CIRC = 2 * Math.PI * R;
const availableLength = CIRC - GAP * statusCounts.length;

let cumulative = 0;
let svgArcs = '';
statusCounts.forEach(s => {
    const segLen = (s.count / totalComplaints) * availableLength;
    svgArcs += `<circle class="donut-arc" data-status="${s.status}" data-count="${s.count}"
        data-start="${cumulative}" data-len="${segLen}"
        cx="${CX}" cy="${CY}" r="${R}" fill="none"
        stroke="${statusColors[s.status]}" stroke-width="30" stroke-linecap="butt"
        stroke-dasharray="0 ${CIRC}"
        stroke-dashoffset="${-cumulative}"
        transform="rotate(-90 ${CX} ${CY})"></circle>`;
    cumulative += segLen + GAP;
});

const donutWrap = document.getElementById('donutChartWrap');
donutWrap.innerHTML = `
    <svg viewBox="0 0 200 200" width="180" height="180">${svgArcs}</svg>
    <div class="donut-tooltip" id="donutTooltip"></div>
`;

const donutTooltip = document.getElementById('donutTooltip');
const donutArcs = donutWrap.querySelectorAll('.donut-arc');

// ---------- Arc Sweep (Circular Reveal) animation on dashboard load ----------
// A single continuous line sweeps once around the full circle; each color
// segment gets "painted in" the moment the sweep passes over it.
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function animateDonutSweep(duration){
    const startTime = performance.now();
    function frame(now){
        const t = Math.min((now - startTime) / duration, 1);
        const sweepLength = easeOutCubic(t) * CIRC;
        donutArcs.forEach(arc => {
            const start = parseFloat(arc.dataset.start);
            const len = parseFloat(arc.dataset.len);
            const revealed = Math.max(0, Math.min(sweepLength - start, len));
            arc.setAttribute('stroke-dasharray', `${revealed} ${CIRC - revealed}`);
        });
        if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

setTimeout(() => animateDonutSweep(1300), 200);

donutArcs.forEach(arc => {
    arc.addEventListener('mouseenter', () => {
        donutTooltip.textContent = `${arc.dataset.status.toLowerCase()} : ${arc.dataset.count}`;
        donutTooltip.classList.add('show');
    });
    arc.addEventListener('mouseleave', () => {
        donutTooltip.classList.remove('show');
    });
    arc.addEventListener('click', (e) => {
        e.stopPropagation();
        donutArcs.forEach(a => a.classList.remove('dimmed'));
        donutTooltip.textContent = `${arc.dataset.status.toLowerCase()} : ${arc.dataset.count}`;
        donutTooltip.classList.add('show');
        arc.classList.add('dimmed');
    });
});

document.addEventListener('click', () => {
    donutTooltip.classList.remove('show');
    donutArcs.forEach(a => a.classList.remove('dimmed'));
});

document.getElementById('complaintLegend').innerHTML = statusCounts.map(s =>
    `<span><i class="dot ${legendColorClass[s.status]}"></i>${s.status} (${s.count})</span>`
).join('');

// ---------- Bar chart (Monthly Collection) ----------
const MAX = 30000;
const plot = document.getElementById('plotArea');

const tooltip = document.createElement('div');
tooltip.className = 'chart-tooltip';
document.body.appendChild(tooltip);

function showTooltip(e, d){
    tooltip.innerHTML = `
        <div class="tt-month">${d.month}</div>
        <div class="tt-row tt-billed">Billed : ₹${d.billed.toLocaleString('en-IN')}</div>
        <div class="tt-row tt-collected">Collected : ₹${d.collected.toLocaleString('en-IN')}</div>
    `;
    tooltip.classList.add('show');
    positionTooltip(e);
}
function positionTooltip(e){
    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2;
    const minLeft = 8 + window.scrollX;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - tooltip.offsetWidth - 8;
    left = Math.max(minLeft, Math.min(left, maxLeft));
    tooltip.style.left = left + 'px';
    tooltip.style.top  = (rect.top + window.scrollY - tooltip.offsetHeight - 10) + 'px';
}
function hideTooltip(){
    tooltip.classList.remove('show');
}

chartData.forEach((d, i) => {
    const group = document.createElement('div');
    group.className = 'month-group';

    const isEmpty = d.billed === 0 && d.collected === 0;

    const pair = document.createElement('div');
    pair.className = 'bars-pair';

    const track = document.createElement('div');
    track.className = 'bar track';
    track.style.height = '0%';
    track.style.opacity = '0';

    const value = document.createElement('div');
    value.className = 'bar value';
    value.style.height = '0%';
    value.style.opacity = '0';

    pair.appendChild(track);
    pair.appendChild(value);
    group.appendChild(pair);

    requestAnimationFrame(() => {
        setTimeout(() => {
            const trackHeight = isEmpty ? 3 : (d.billed / MAX * 100);
            const valueHeight = isEmpty ? 0 : (d.collected / MAX * 100);
            track.style.height = trackHeight + '%';
            track.style.opacity = isEmpty ? '0.35' : '1';
            value.style.height = valueHeight + '%';
            value.style.opacity = isEmpty ? '0' : '1';
        }, 100 + i * 70);
    });

    pair.addEventListener('mouseenter', (e) => showTooltip(e, d));
    pair.addEventListener('mousemove', positionTooltip);
    pair.addEventListener('mouseleave', hideTooltip);

    const label = document.createElement('div');
    label.className = 'month-label';
    label.textContent = d.month;
    group.appendChild(label);

    plot.appendChild(group);
});

// =====================================================
// ---------- Recent Activities
// =====================================================
const activitiesList = document.getElementById('activitiesList');
activities.forEach((a, i) => {
    activitiesList.innerHTML += `
      <div class="item" style="animation-delay:${i * 0.06}s">
        <div class="item-icon">${activityIcons[a.type]}</div>
        <div class="item-body">
          <p>${a.text}</p>
          <span>${a.time}</span>
        </div>
      </div>`;
});

// =====================================================
// ---------- Recent Members (real member list, top 5)
// =====================================================
const recentMembers = allMembers.slice(0, 5);
const membersList = document.getElementById('membersList');
recentMembers.forEach((m, i) => {
    const initials = m.name.split(' ').map(w => w[0]).join('');
    membersList.innerHTML += `
      <div class="item item-center" style="animation-delay:${i * 0.06}s">
        <div class="item-icon">${initials}</div>
        <div class="item-body">
          <p class="title-bold">${m.name}</p>
          <span>${m.role}</span>
        </div>
        <span class="tag">${m.flatNo}</span>
      </div>`;
});

// =====================================================
// ---------- Latest Notices (real notices list, top 5)
// =====================================================
const recentNotices = allNotices.slice(0, 5);
const noticesList = document.getElementById('noticesList');
recentNotices.forEach((n, i) => {
    noticesList.innerHTML += `
      <div class="item item-center" style="animation-delay:${i * 0.06}s">
        ${n.pinned ? `<span class="item-pin">${pinIcon}</span>` : ''}
        <div class="item-body">
          <p class="title-bold truncate">${n.title}</p>
          <span>${n.postedAgo}</span>
        </div>
        <span class="tag">${n.tag}</span>
      </div>`;
});

// ---------- Footer: Meet the team dropdown ----------
const teamToggle = document.getElementById('teamToggle');
const teamDropdown = document.getElementById('teamDropdown');

teamToggle.addEventListener('click', function(e){
    e.stopPropagation();
    teamDropdown.classList.toggle('show');
});

document.addEventListener('click', function(){
    teamDropdown.classList.remove('show');
});