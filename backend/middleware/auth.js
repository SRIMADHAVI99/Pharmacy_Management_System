const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin role required' });
    }
};

const isPharmacist = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Pharmacist')) {
        next();
    } else {
        res.status(403).json({ error: 'Pharmacist or Admin role required' });
    }
};

module.exports = { verifyToken, isAdmin, isPharmacist };
