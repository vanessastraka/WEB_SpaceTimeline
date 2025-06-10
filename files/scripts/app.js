// app.js – passend zu deinen HTML-IDs!

// IDs aus deiner HTML
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userSpan  = document.getElementById('user-info');
const msg       = document.getElementById('login-error');
const toFavSite = document.getElementById('to-fav-site');

// === Hilfsfunktionen für JWT und API ===
function saveToken(t)   { localStorage.setItem('jwt', t); }
function getToken()     { return localStorage.getItem('jwt'); }
function clearToken()   { localStorage.removeItem('jwt'); }

function getUsernameFromToken() {
    const token = getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])).username; }
    catch { return null; }
}

function api(path, opts={}) {
    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer '+token;
    return fetch('/api'+path, opts).then(r => r.json());
}

// === UI-Funktionen ===
function showApp(username) {
    if (loginForm) loginForm.classList.add('hidden');
    if (userSpan) {
        userSpan.textContent = 'Logged in: ' + username;
        userSpan.classList.remove('hidden');
    }
    if (logoutBtn) logoutBtn.classList.remove('hidden');

    // Favorite-Link anzeigen
    if (toFavSite) toFavSite.classList.remove('hidden');
}
function showLogin() {
    if (loginForm) loginForm.classList.remove('hidden');
    if (userSpan) userSpan.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (msg) msg.classList.add('hidden');
    if (toFavSite) toFavSite.classList.add('hidden');
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M4: FE/BE (AJAX) - Sends user login data asynchronously using `fetch()`. Next Step: z95
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9: Session management (Login, sessionID, JWT, ...).
// 1) Login -> Formular (Benutzer, Passwort)
// 2) Session-Management über JWT
//      nach Login gibt BE JWT zurück;
//      FE speichert token in lokalStorage;
// 3) bei weiteren requests  wird Token als Header mitgeschickt -> BE prüft JWT
// 4) Logout -> JWT aus Speicher löschen
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // === Login-Formular ===
if (loginForm) {
    loginForm.onsubmit = async e => {
        e.preventDefault();
        if (msg) msg.classList.add('hidden');
        const u = loginForm.username.value;
        const p = loginForm.password.value;
        const res = await api('/login', {
            method: 'POST',
            body: JSON.stringify({ username: u, password: p }),
        });
        if (res.token) {
            saveToken(res.token);
            showApp(u);
        } else if (msg) {
            msg.textContent = res.error || 'Error while logging in.';
            msg.classList.remove('hidden');
        }
    };
}

// === Logout ===
if (logoutBtn) {
    logoutBtn.onclick = () => {
        clearToken();
        showLogin();
    };
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                 M4: FE/BE (AJAX) - Checks if the user has a valid session token asynchronously.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// === Session-Check ===
async function checkSession() {
    const token = getToken();
    if (!token) {
        showLogin();
        return;
    }
    // Hole Username über /api/me, wenn vorhanden
    try {
        const res = await fetch('/api/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        showApp(data.username);
    } catch {
        clearToken();
        showLogin();
    }
}

// === Initialisierungs-Logik ===
window.addEventListener('DOMContentLoaded', () => {
    checkSession();
});