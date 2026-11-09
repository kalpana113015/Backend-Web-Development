const jwt = require('jsonwebtoken');

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
  });
}

module.exports = {
  signToken,
  verifyToken,
};
