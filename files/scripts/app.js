const API = '/api';
const msg = document.getElementById('msg');
const lp  = document.getElementById('login-panel');
const ap  = document.getElementById('app-panel');
const userSpan = document.getElementById('user');

function saveToken(t) { localStorage.setItem('jwt', t); }
function getToken()    { return localStorage.getItem('jwt'); }
function clearToken()  { localStorage.removeItem('jwt'); }
function api(path, opts={}) {
    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer '+token;
    return fetch(API+path, opts).then(r => r.json());
}

document.getElementById('register-form').onsubmit = async e => {
    e.preventDefault();
    msg.textContent = '';
    const data = Object.fromEntries(new FormData(e.target));
    const res = await api('/register', {method:'POST', body: JSON.stringify(data)});
    msg.textContent = res.error || 'Registriert! Bitte einloggen.';
};

document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    msg.textContent = '';
    const data = Object.fromEntries(new FormData(e.target));
    const res = await api('/login', {method:'POST', body: JSON.stringify(data)});
    if (res.token) {
        saveToken(res.token);
        showApp(data.username);
    } else {
        msg.textContent = res.error || 'Fehler beim Login';
    }
};

document.getElementById('logout').onclick = () => {
    clearToken();
    showLogin();
};

function showApp(username) {
    lp.classList.add('hidden');
    ap.classList.remove('hidden');
    userSpan.textContent = username;
}

function showLogin() {
    ap.classList.add('hidden');
    lp.classList.remove('hidden');
    msg.textContent = '';
}

// on load
if (getToken()) {
    // optional: validieren mit /profile-Endpoint
    showApp('…');
} else {
    showLogin();
}
