const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log("Incoming Authorization Header:", authHeader); // ✅ Debugging step

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Access Denied: No Token Provided');
  }

  const token = authHeader.split(' ')[1]; // Extract token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid Token');
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateJWT;
