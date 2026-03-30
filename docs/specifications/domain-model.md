# Domain Model — Whiskey Reviews

---

## Overview

The **Whiskey Reviews** domain consists of two primary resources: a curated **Whiskey** inventory managed by admins, and **WhiskeyReviews** written by reviewers for whiskies in that inventory. There are three roles: `admin` (manages the inventory), `reviewer` (writes and manages their own reviews), and `viewer` (read-only access).

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
| `role` | enum | Yes | `admin`, `reviewer`, or `viewer` |
| `createdAt` | ISO 8601 | Yes | Registration timestamp |

**Business Rules:**
- Email must be unique across all users.
- Password is stored as a bcrypt hash; never returned in API responses.
- Role is set at registration and cannot be changed via the API.

---

### Whiskey

Represents a whiskey entry in the curated inventory, managed by admins.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `name` | string | Yes | Name of the whiskey (min 1 char) |
| `distillery` | string | Yes | Name of the distillery (min 1 char) |
| `region` | string \| null | No | Region of origin (e.g., Speyside, Islay, Highland) |
| `age` | integer \| null | No | Age statement in years; null for no age statement (NAS) |
| `description` | string \| null | No | Optional description of the whiskey |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |
| `updatedAt` | ISO 8601 | Yes | Last update timestamp |

**Business Rules:**
- Only users with the `admin` role may add, edit, or remove whiskies.
- All authenticated users may list and view whiskies.

---

### WhiskeyReview

Represents a whiskey tasting review written by a reviewer for a whiskey in the inventory.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `whiskeyId` | UUID | Yes | ID of the whiskey being reviewed (must exist in inventory) |
| `rating` | integer | Yes | Rating from 1 to 100 (inclusive) |
| `tastingNotes` | string \| null | No | Optional tasting notes |
| `status` | enum | Yes | `published` or `archived` |
| `reviewerId` | UUID | Yes | ID of the reviewer who wrote this review |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |
| `updatedAt` | ISO 8601 | Yes | Last update timestamp |

**Business Rules:**
- `status` defaults to `published` on creation.
- `rating` must be between 1 and 100 inclusive.
- `whiskeyId` must reference an existing Whiskey in the inventory; returns 404 if not found.
- Only the reviewer who added a review may edit or remove it.
- Viewers may list and view any review but cannot modify them.

---

## Relationships

```
User (role=admin)     ──── manages many ──── Whiskey
User (role=reviewer)  ──── writes many  ──── WhiskeyReview
WhiskeyReview ────────────── for one ──────── Whiskey (whiskeyId)
WhiskeyReview ────────────── belongs to ───── User (reviewerId)
```

---

## Aggregates

| Aggregate Root | Entities Contained | Description |
|---------------|-------------------|-------------|
| `Whiskey` | Whiskey | Self-contained; managed exclusively by admins |
| `WhiskeyReview` | WhiskeyReview | Self-contained; ownership tracked via `reviewerId` |
| `User` | User | Self-contained; no nested child entities |

---

## Domain Events

| Event | Trigger | Channel |
|-------|---------|---------|
| `WhiskeyAdded` | POST /v1/whiskies → 201 | `whiskies.whiskey.added` |
| `WhiskeyEdited` | PATCH /v1/whiskies/{whiskeyId} → 200 | `whiskies.whiskey.edited` |
| `WhiskeyRemoved` | DELETE /v1/whiskies/{whiskeyId} → 204 | `whiskies.whiskey.removed` |
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
