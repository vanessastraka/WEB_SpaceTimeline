//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.4.1: JWT Validation
// JWT wird geprüft, und dann zurück ans frontend geschickt, wenn es valide
// RequireAdmin ist zum prüfen ob im JWT die rolle ADMIN vorhanden ist -> Admin Dashboard
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No Token' });
    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.id;
        req.userRole = payload.role || 'user'; // <--- Rolle immer im Request speichern!
        next();
    } catch {
        res.status(401).json({ error: 'Invalid Token' });
    }
}

function requireAdmin(req, res, next) {
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
