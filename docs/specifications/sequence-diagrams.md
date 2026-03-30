# Sequence Diagrams — Whiskey Reviews

---

## Flow 1: Register and Log In

```mermaid
sequenceDiagram
    participant Client
    participant API

    Client->>API: POST /v1/auth/register<br/>{ email, password, role: "reviewer" }
    API-->>Client: 201 { accessToken, refreshToken, user }

    Client->>API: POST /v1/auth/login<br/>{ email, password }
    API-->>Client: 200 { accessToken, refreshToken, user }
```

---

## Flow 2: Reviewer Adds and Manages Reviews

```mermaid
sequenceDiagram
    participant Reviewer
    participant API

    Reviewer->>API: POST /v1/reviews<br/>{ whiskeyName: "Glenfiddich 12", distillery: "Glenfiddich", rating: 85 }<br/>Authorization: Bearer <token>
    API-->>Reviewer: 201 { id, whiskeyName, distillery, rating, status: "published", reviewerId, ... }

    Reviewer->>API: GET /v1/reviews<br/>Authorization: Bearer <token>
    API-->>Reviewer: 200 { data: [...], pagination: { page, pageSize, total } }

    Reviewer->>API: PATCH /v1/reviews/{reviewId}<br/>{ tastingNotes: "Fruity with a hint of oak", status: "archived" }<br/>Authorization: Bearer <token>
    API-->>Reviewer: 200 { id, whiskeyName, tastingNotes, status: "archived", ... }

    Reviewer->>API: DELETE /v1/reviews/{reviewId}<br/>Authorization: Bearer <token>
    API-->>Reviewer: 204
```

---

## Flow 3: Viewer Browses Reviews

```mermaid
sequenceDiagram
    participant Viewer
    participant API

    Viewer->>API: POST /v1/auth/login<br/>{ email, password }
    API-->>Viewer: 200 { accessToken, ... }

    Viewer->>API: GET /v1/reviews<br/>Authorization: Bearer <token>
    API-->>Viewer: 200 { data: [...], pagination: { ... } }

    Viewer->>API: GET /v1/reviews/{reviewId}<br/>Authorization: Bearer <token>
    API-->>Viewer: 200 { id, whiskeyName, distillery, rating, tastingNotes, status, ... }

    Viewer->>API: POST /v1/reviews<br/>{ whiskeyName: "Laphroaig 10" }<br/>Authorization: Bearer <token>
    API-->>Viewer: 403 { code: "FORBIDDEN" }
```

---

## Flow 4: Token Refresh

```mermaid
sequenceDiagram
    participant Client
    participant API

    Note over Client: Access token has expired

    Client->>API: POST /v1/auth/refresh<br/>{ refreshToken }
    API-->>Client: 200 { accessToken, refreshToken }

    Client->>API: GET /v1/reviews<br/>Authorization: Bearer <new_token>
    API-->>Client: 200 { data: [...] }
```

---

## Notes

- All authenticated requests include `Authorization: Bearer <token>` (omitted from some diagrams for brevity).
- `4xx` error paths are covered by the auth matrix — see `auth-matrix.md`.
