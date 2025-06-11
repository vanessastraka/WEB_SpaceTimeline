//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  M9: SESSION MANAGEMENT
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// IDs aus HTML
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userSpan = document.getElementById('user-info');
const msg = document.getElementById('login-error');
const toFavSite = document.getElementById('to-fav-site');

// === Hilfsfunktionen für JWT und API ===
function saveToken(t)   { localStorage.setItem('jwt', t); }
function getToken()     { return localStorage.getItem('jwt'); }
function clearToken()   { localStorage.removeItem('jwt'); }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.1: Login - UserData (index.html (Formular) + app.js (Login-form))
//      a. User gibt Login ein --> click on submit button
//      b. Login-Formular löst ein Submit-Event aus.
//      c. app.js fängt das ab und ruft die Login-API auf.
// Next: Z66: function api(...
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// === Login-Formular ===
document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (msg) msg.classList.add('hidden');
    const u = loginForm.username.value;
    const p = loginForm.password.value;
    const res = await api('/login', {
        method: 'POST',
        body: JSON.stringify({username: u, password: p}),
    });

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.4: Frontend speichert JWT im localStorage
//      a. Die JS-Funktion speichert das JWT im Browser (localStorage).
//      b. Danach wird showApp(u) aufgerufen - zeigt Username u im UI an.
// Next: scripts/app.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    if (res.token) {
        saveToken(res.token); // -- (a)
        showApp(u); // -- (b)
    } else if (msg) {
        msg.textContent = res.error || 'Fehler beim Login';
        msg.classList.remove('hidden');
    }
})

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.2: Frontend sendet Daten ans Backend - (API Helper)
//      a. api('/login', {...}) ruft die Backend-Route /api/login auf.
//      b. Es wird ein HTTP POST mit JSON {username, password} geschickt.
// Next: routes/auth.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.5: JWT wird für alle zukünftigen Requests verwendet - (API Helper)
//      a. Wenn Frontend API-Requests macht, wird JWT immer im Authorization-Header mitgeschickt.
// Next: middleware/auth.js (wenn Anfrage geschickt wird)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// API Wrapper (JWT immer mitsenden)
function api(path, opts = {}) {
    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token; // -- (a)
    return fetch('/api' + path, opts).then(r => r.json()); //<- hier
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                 M4: FE/BE (AJAX) - Checks if the user has a valid session token asynchronously.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.6: Session-Check auf der Startseite
//      a. Beim Laden der Seite wird per /api/me (routes/auth.js) geprüft, ob JWT noch gültig ist.
//      b. Wenn Token gültig, dann OK --> else error
// Next: Last Step - Logout Z.130
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// === Session-Check ===
async function checkSession() {
    const token = getToken();
    if (!token) {
        showLogin(); // -- (a)
        return;
    }
    // Hole Username über /api/me, wenn vorhanden
    try {
        const res = await fetch('/api/me', {
            headers: {'Authorization': 'Bearer ' + token} // -- (a)
        });
        if (!res.ok) throw new Error(); // -- (b)
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
// M9.7: Logout
//      a. Beim Logout wird der JWT gelöscht, die UI wechselt zurück zu Login.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// === Logout --> löscht auch den Token der Session aus dem LocalStorage des Browsers ===
document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearToken(); // -- (a)
    showLogin(); // -- (a)
})