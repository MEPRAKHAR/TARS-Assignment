const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Get token from header "Authorization: Bearer token"
  if (!token) {
    return res.status(401).send('Access Denied'); // No token means unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid Token');  // Token is invalid or expired
    }
    req.user = user;  // Add the decoded user info to the request object
    next();
  });
};

module.exports = authenticateJWT;
