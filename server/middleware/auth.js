const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, 'super_secret_jwt_key_change_me_later', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    
    // Attach the verified user payload (which contains the userId) to the request
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;