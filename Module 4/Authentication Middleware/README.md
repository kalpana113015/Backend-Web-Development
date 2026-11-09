# Authentication Middleware Assignment

Implement `requireAuth`, an Express middleware that reads a Bearer token from the `Authorization` request header, verifies it using HS256 and `JWT_SECRET`, attaches the decoded payload to `req.user`, and guards protected routes.

## Endpoints

- `POST /auth/login` (Public): Issues a signed JWT.
- `GET /profile` (Protected): Returns profile information for the verified user.
- `GET /posts/my` (Protected): Returns post collection for the verified user.
- `POST /posts` (Protected): Creates a post for the verified user.
