require('dotenv').config();
const express = require('express');
const { signToken } = require('./utils/jwt');
const requireAuth = require('./middleware/requireAuth');

const app = express();
app.use(express.json());

// Public route: POST /auth/login
app.post('/auth/login', (req, res) => {
  const payload = req.body && req.body.userId ? req.body : { userId: 'user-1' };
  const token = signToken(payload);
  return res.json({ token });
});

// Protected route: GET /profile
app.get('/profile', requireAuth, (req, res) => {
  return res.json({
    userId: req.user.userId,
    message: 'Profile data',
  });
});

// Protected route: GET /posts/my
app.get('/posts/my', requireAuth, (req, res) => {
  return res.json({
    userId: req.user.userId,
    posts: [],
  });
});

// Protected route: POST /posts
app.post('/posts', requireAuth, (req, res) => {
  return res.status(201).json({
    userId: req.user.userId,
    message: 'Post created',
  });
});

const PORT = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
