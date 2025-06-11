const jwt = require('jsonwebtoken');

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.6: Backend prüft JWT bei geschützten Routen
//      a. Alle geschützten Routen nutzen die Middleware requireAuth.
//      b. Middleware prüft JWT, entschlüsselt Userinfo, hängt sie an req.
//      c. Für Admin-DB wird zusätzlich noch die Rolle geprüft, für extra Sicherheit.
// Next: scripts/app.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No Token' });
    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET); // -- (a/b)
        req.userId = payload.id;
        req.userRole = payload.role || 'user';
        next();
    } catch {
        res.status(401).json({ error: 'Invalid Token' });
    }
}

function requireAdmin(req, res, next) { // -- (c)
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No Token' });
    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorised' });
        }
        req.userId = payload.id;
        req.userRole = payload.role;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid Token' });
    }
}

// Korrekt exportieren:
module.exports = {
    requireAuth,
    requireAdmin
};
