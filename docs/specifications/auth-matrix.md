# Auth Matrix — Whiskey Reviews

---

## Roles

| Role | Description |
|------|-------------|
| `admin` | Manages the whiskey inventory (add, edit, remove whiskies) |
| `reviewer` | Can add reviews and edit/remove their own reviews |
| `viewer` | Read-only access to whiskies and reviews |

## Authentication

All protected routes require a `Bearer` JWT token in the `Authorization` header.
Unauthenticated requests to protected routes return `401 Unauthorized`.

Tokens are issued via `POST /v1/auth/login` and refreshed via `POST /v1/auth/refresh`.

## Auth Matrix

| Operation | Endpoint | Public | admin | reviewer | viewer |
|-----------|----------|--------|-------|----------|--------|
| Register | `POST /v1/auth/register` | Yes | Yes | Yes | Yes |
| Login | `POST /v1/auth/login` | Yes | Yes | Yes | Yes |
| Refresh token | `POST /v1/auth/refresh` | Yes | Yes | Yes | Yes |
| Logout | `POST /v1/auth/logout` | No | Yes | Yes | Yes |
| List whiskies | `GET /v1/whiskies` | No | Yes | Yes | Yes |
| Add whiskey | `POST /v1/whiskies` | No | Yes | No | No |
| View whiskey | `GET /v1/whiskies/{whiskeyId}` | No | Yes | Yes | Yes |
| Edit whiskey | `PATCH /v1/whiskies/{whiskeyId}` | No | Yes | No | No |
| Remove whiskey | `DELETE /v1/whiskies/{whiskeyId}` | No | Yes | No | No |
| List reviews | `GET /v1/reviews` | No | Yes | Yes | Yes |
| Add review | `POST /v1/reviews` | No | No | Yes | No |
| View review | `GET /v1/reviews/{reviewId}` | No | Yes | Yes | Yes |
| Edit review | `PATCH /v1/reviews/{reviewId}` | No | No | Yes (own) | No |
| Remove review | `DELETE /v1/reviews/{reviewId}` | No | No | Yes (own) | No |

Legend:
- Public column — Yes: No auth required; No: Auth required
- Role columns — Yes: Allowed; Yes (own): Allowed only if `review.reviewerId === req.user.sub`; No: Forbidden

## Ownership Rule

A `reviewer` may only edit or remove reviews where `review.reviewerId` matches their user ID (`req.user.sub`). Attempting to modify another reviewer's review returns `403 Forbidden`.

## Error Responses

| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| No token provided | `401` | `AUTHENTICATION_REQUIRED` |
| Token expired | `401` | `TOKEN_EXPIRED` |
| Valid token, wrong role | `403` | `FORBIDDEN` |
| Valid token, not review owner | `403` | `FORBIDDEN` |
