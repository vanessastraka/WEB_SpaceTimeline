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

// Login
document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    const { username, password } = Object.fromEntries(new FormData(e.target));
    const res = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    if (res.token) {
        saveToken(res.token);
        showApp(username);
    } else {
        msg.textContent = res.error || 'Fehler beim Login';
    }
};

// Registration
document.getElementById('reg-form').onsubmit = async e => {
    e.preventDefault();
    const { username, password } = Object.fromEntries(new FormData(e.target));
    const res = await api('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    msg.textContent = res.error || 'Registriert! Bitte einloggen.';
};


document.getElementById('logout-btn').onclick = () => {
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

// token-utils.js
export function getUsernameFromToken() {
    const token = localStorage.getItem('jwt');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
}

// on load
const savedUser = getUsernameFromToken();
if (savedUser) {
    showApp(savedUser);
} else {
    showLogin();
}
