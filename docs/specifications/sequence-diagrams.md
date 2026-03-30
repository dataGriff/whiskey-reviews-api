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

## Flow 2: Admin Manages Whiskey Inventory

```mermaid
sequenceDiagram
    participant Admin
    participant API

    Admin->>API: POST /v1/whiskies<br/>{ name: "Laphroaig 10", distillery: "Laphroaig", region: "Islay", age: 10 }<br/>Authorization: ******
    API-->>Admin: 201 { id, name, distillery, region, age, ... }

    Admin->>API: GET /v1/whiskies<br/>Authorization: ******
    API-->>Admin: 200 { data: [...], pagination: { page, pageSize, total } }

    Admin->>API: PATCH /v1/whiskies/{whiskeyId}<br/>{ description: "Classic Islay single malt." }<br/>Authorization: ******
    API-->>Admin: 200 { id, name, distillery, description, ... }

    Admin->>API: DELETE /v1/whiskies/{whiskeyId}<br/>Authorization: ******
    API-->>Admin: 204
```

---

## Flow 3: Reviewer Submits a Review

```mermaid
sequenceDiagram
    participant Reviewer
    participant API

    Reviewer->>API: GET /v1/whiskies<br/>Authorization: ******
    API-->>Reviewer: 200 { data: [{ id, name, distillery, ... }], pagination: { ... } }

    Reviewer->>API: POST /v1/reviews<br/>{ whiskeyId: "<id>", rating: 90, tastingNotes: "Smoky and peaty" }<br/>Authorization: ******
    API-->>Reviewer: 201 { id, whiskeyId, rating, tastingNotes, status: "published", reviewerId, ... }

    Reviewer->>API: PATCH /v1/reviews/{reviewId}<br/>{ tastingNotes: "Smoky, peaty, with a long finish", status: "archived" }<br/>Authorization: ******
    API-->>Reviewer: 200 { id, whiskeyId, rating, tastingNotes, status: "archived", ... }

    Reviewer->>API: DELETE /v1/reviews/{reviewId}<br/>Authorization: ******
    API-->>Reviewer: 204
```

---

## Flow 4: Viewer Browses Whiskies and Reviews

```mermaid
sequenceDiagram
    participant Viewer
    participant API

    Viewer->>API: POST /v1/auth/login<br/>{ email, password }
    API-->>Viewer: 200 { accessToken, ... }

    Viewer->>API: GET /v1/whiskies<br/>Authorization: ******
    API-->>Viewer: 200 { data: [...], pagination: { ... } }

    Viewer->>API: GET /v1/reviews<br/>Authorization: ******
    API-->>Viewer: 200 { data: [...], pagination: { ... } }

    Viewer->>API: POST /v1/whiskies<br/>{ name: "Forbidden Dram" }<br/>Authorization: ******
    API-->>Viewer: 403 { code: "FORBIDDEN" }
```

---

## Flow 5: Token Refresh

```mermaid
sequenceDiagram
    participant Client
    participant API

    Note over Client: Access token has expired

    Client->>API: POST /v1/auth/refresh<br/>{ refreshToken }
    API-->>Client: 200 { accessToken, refreshToken }

    Client->>API: GET /v1/whiskies<br/>Authorization: ******
    API-->>Client: 200 { data: [...] }
```

---

## Notes

- All authenticated requests include `Authorization: ****** (omitted from some diagrams for brevity).
- `4xx` error paths are covered by the auth matrix — see `auth-matrix.md`.
