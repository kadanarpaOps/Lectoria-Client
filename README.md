# Lectoria Client

## API configuration

`VITE_API_URL` points to the Lectoria API base (normally ending in `/api/`). Story requests use `VITE_STORY_API_URL` when set; otherwise the client removes the `/api` suffix from `VITE_API_URL` and calls story-service routes under `/api/*`.

The shared verification dialog checks for an active verification, creates one when needed, accepts and verifies the OTP, and supports code regeneration. Registration then calls `POST /users/verify-registry`; email, password, and deactivation flows call their authenticated account endpoint after OTP verification. Password recovery can create and verify a `FORGOT_PASSWORD` code, but the current API has no unauthenticated password-reset operation; the UI explicitly tells users that no password change was made.

## Current API contract limits

The authenticated user-profile response may omit a user UUID, which keeps personal story actions unavailable until the API returns one. Admin listing uses `GET /auth/admin/users`, whose response includes user IDs and account enabled status. The public user directory uses `GET /users`, which intentionally excludes the current user and all ADMIN accounts. Profile-image changes use authenticated `PATCH`/`DELETE /auth/user/profile-image` endpoints. A user-by-ID profile endpoint is not provided.