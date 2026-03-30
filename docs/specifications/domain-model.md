# Domain Model — Whiskey Reviews

---

## Overview

The **Whiskey Reviews** domain is a catalogue of whiskey tasting reviews. Each review is written by a reviewer and captures whiskey metadata (distillery, region, age) alongside a personal rating and tasting notes. There are two roles: `reviewer` (writes and manages their own reviews) and `viewer` (read-only access).

---

## Entities

### User

Represents an authenticated user of the system.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `email` | string (email) | Yes | User's email address (unique) |
| `password` | string (hashed) | Yes | Bcrypt-hashed password (never returned in responses) |
| `firstName` | string | Yes | Given name |
| `lastName` | string | Yes | Family name |
| `role` | enum | Yes | `reviewer` or `viewer` |
| `createdAt` | ISO 8601 | Yes | Registration timestamp |

**Business Rules:**
- Email must be unique across all users.
- Password is stored as a bcrypt hash; never returned in API responses.
- Role is set at registration and cannot be changed via the API.

---

### WhiskeyReview

Represents a whiskey tasting review written by a reviewer.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `whiskeyName` | string | Yes | Name of the whiskey (min 1 char) |
| `distillery` | string | Yes | Name of the distillery (min 1 char) |
| `region` | string \| null | No | Region of origin (e.g., Speyside, Islay, Highland) |
| `age` | integer \| null | No | Age statement in years; null for no age statement (NAS) |
| `rating` | integer | Yes | Rating from 1 to 100 (inclusive) |
| `tastingNotes` | string \| null | No | Optional tasting notes |
| `status` | enum | Yes | `published` or `archived` |
| `reviewerId` | UUID | Yes | ID of the reviewer who wrote this review |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |
| `updatedAt` | ISO 8601 | Yes | Last update timestamp |

**Business Rules:**
- `status` defaults to `published` on creation.
- `rating` must be between 1 and 100 inclusive.
- Only the reviewer who added a review may edit or remove it.
- Viewers may list and view any review but cannot modify them.

---

## Relationships

```
User (role=reviewer) ──── writes many ──── WhiskeyReview
WhiskeyReview ──── belongs to ─────────── User (reviewerId)
```

---

## Aggregates

| Aggregate Root | Entities Contained | Description |
|---------------|-------------------|-------------|
| `WhiskeyReview` | WhiskeyReview | Self-contained; ownership is tracked via `reviewerId` |
| `User` | User | Self-contained; no nested child entities |

---

## Domain Events

| Event | Trigger | Channel |
|-------|---------|---------|
| `ReviewAdded` | POST /v1/reviews → 201 | `reviews.review.added` |
| `ReviewEdited` | PATCH /v1/reviews/{reviewId} → 200 | `reviews.review.edited` |
| `ReviewRemoved` | DELETE /v1/reviews/{reviewId} → 204 | `reviews.review.removed` |

---

## Status Lifecycle

### WhiskeyReview Status

```
published ⟷ archived
```

| From | To | Trigger |
|------|----|---------|
| `published` | `archived` | PATCH /v1/reviews/{reviewId} with `status: "archived"` |
| `archived` | `published` | PATCH /v1/reviews/{reviewId} with `status: "published"` |

Reviews can be toggled between `published` and `archived` freely by their owner reviewer.
