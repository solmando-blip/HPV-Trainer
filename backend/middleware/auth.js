const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Zugriff verweigert. Kein Token vorhanden.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'hpv_secret_key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Ungültiger Token.' });
  }
};

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Aktion.' });
    }
    next();
  };
};

const getOptionalUser = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'hpv_secret_key');
  } catch (err) {
    return null;
  }
};

module.exports = { verifyToken, verifyRoles, getOptionalUser };
