# Technical Debt Summary

Open Items: 7

Completed Items: 6

Last Updated:
24 July 2026

# UNiMART — Technical Debt Log

This file is the single source of truth for every intentionally deferred issue
in the project. Nothing gets fixed "along the way" outside its planned
module — it gets logged here, then addressed in the milestone listed.

Update this file whenever:
- A new piece of debt is discovered during implementation of any module.
- A logged item is resolved (move Status to `Completed`, note the module/tag it was fixed in).

---

## 1. DNS workaround for local MongoDB Atlas connection

- **Description:** `dns.setServers(["8.8.8.8"])` was added to work around a local
  Windows DNS resolver failing SRV lookups (`ECONNREFUSED`) when connecting to
  MongoDB Atlas.
- **Why deferred:** This is a local development environment issue, not an
  application bug. `dns.setServers()` changes DNS resolution for the entire
  Node process, not just the Mongo connection, so it needs a deliberate check
  on the actual deployment target rather than being carried over by default.
- **Risk Level:** Low
- **Planned Milestone:** Deployment Module (verify if still needed on Render; remove if not)
- **Status:** Open

---

## 2. `Product.js` `isNew` field collides with Mongoose's reserved property

- **Description:** `isNew` is a built-in Mongoose document property
  (`doc.isNew`, true before first save). `Product.js` defines its own `isNew`
  field for the "new arrival" badge, which collides with it and triggers a
  Mongoose warning. Needs to be renamed (e.g. `isNewArrival`).
- **Why deferred:** Cross-cutting change — touches the backend schema, the
  admin panel's product form, frontend badge-rendering components, and
  potentially a future mobile client. Not a single-module change.
- **Risk Level:** Low
- **Planned Milestone:** Dedicated Refactoring/Maintenance milestone, after core backend modules are complete
- **Status:** Open

---

## 3. Order routes have no authorization

- **Description:** `orderRoutes.js` write operations (create, list, update
  status) and reads have no `protect`/`authorize` middleware. Customer name,
  phone, and address for every order are currently publicly readable, and
  anyone can change an order's status with no login.
- **Why deferred:** Out of scope for the Product Module; each module has a
  single responsibility per the agreed workflow.
- **Risk Level:** High (live data exposure — real customer PII)
- **Planned Milestone:** Order Module
- **Status:** Open

---

## 4. `orderController.js` has dead, duplicated logic

- **Description:** `orderController.js` exports `getAllOrders`, but
  `orderRoutes.js` never uses it — it reimplements order creation, listing,
  and status updates directly inline instead. Two competing implementations
  of the same behavior exist; only one is actually wired up.
- **Why deferred:** Belongs to the Order Module, where the routes are being
  touched anyway for authorization — this is the natural point to
  consolidate into the controller and delete the dead duplicate.
- **Risk Level:** Medium (maintainability — no functional bug today)
- **Planned Milestone:** Order Module
- **Status:** Open

---

## 5. `Order.js` has no reference to a `User` account

- **Description:** Orders currently store `customerName`/`customerPhone`/
  `customerAddress` as free text with no link to a `User` document, so a
  logged-in customer's order history can't be queried yet.
- **Why deferred:** Depends on Checkout being redesigned to attach the
  logged-in user (if any) to a new order — guest checkout must stay
  supported, so this field will be optional.
- **Risk Level:** Medium
- **Planned Milestone:** Checkout / Order Management Module
- **Status:** Open

---

## 6. Cookie-based auth CSRF exposure not yet formally reviewed

- **Description:** httpOnly cookie authentication has some inherent CSRF
  exposure on state-changing requests. Currently partially mitigated by
  `SameSite` cookie settings and the existing CORS origin allowlist, but
  hasn't had a dedicated review (e.g. deciding whether a CSRF token or
  custom-header check is warranted).
- **Why deferred:** Not urgent given the current allowlist is restrictive,
  but deserves a deliberate pass rather than being left implicit.
- **Risk Level:** Medium
- **Planned Milestone:** Security Hardening Module
- **Status:** Open

---

## 7. Formatting inconsistency between `Product.js` and `Order.js`

- **Description:** `Product.js` uses spaced object syntax (`type: String,`),
  `Order.js` uses unspaced (`type:String,`). `Product.js`'s style was adopted
  as the project standard going forward (agreed during the User model
  design), but the existing files were not retroactively reformatted.
- **Why deferred:** Purely cosmetic, not worth a dedicated pass on its own.
- **Risk Level:** Low
- **Planned Milestone:** Whenever `Order.js` is next touched for a substantive reason
- **Status:** Open

---

## 8. `productRoutes.js` imports a non-existent `updateProductStatus`

- **Description:** `productRoutes.js` destructures `updateProductStatus` from
  the product controller, but that function was never implemented. Dead,
  unused import — harmless today since nothing calls it.
- **Why deferred:** N/A — fixed as part of Product Module implementation.
- **Risk Level:** Low
- **Planned Milestone:** Product Module
- **Status:** Completed (Module 3 — Product Management)

---

## 9. `Product.js` `sku` unique index missing `sparse: true`

- **Description:** `sku: { unique: true }` without `sparse: true` risks a raw
  duplicate-key crash if a product is ever saved with no SKU, since MongoDB
  treats multiple `null` values as a collision under a plain unique index.
- **Why deferred:** N/A — fixed as part of Product Module implementation.
- **Risk Level:** Medium
- **Planned Milestone:** Product Module
- **Status:** Completed (Module 3 — Product Management)

---

## 10. `updateProduct` doesn't validate `category` references a real category

- **Description:** `createProduct` validates a submitted `category` id
  against real `Category` documents; `updateProduct` (generic `$set`) does
  not, so an update could set a product's category to a nonexistent id.
- **Why deferred:** N/A — fixed as part of Product Module implementation.
- **Risk Level:** Medium
- **Planned Milestone:** Product Module
- **Status:** Completed (Module 3 — Product Management)

---

## 11. Product write routes have no authorization

- **Description:** `POST`/`PUT`/`PATCH`/`DELETE` on `/api/products` have no
  `protect`/`authorize` middleware — any unauthenticated request can create,
  edit, or delete products.
- **Why deferred:** N/A — fixed as part of Product Module implementation.
- **Risk Level:** High
- **Planned Milestone:** Product Module
- **Status:** Completed (Module 3 — Product Management)

---

## 12. `createProduct`/`updateProduct` lack real input validation

- **Description:** Bad data (negative prices, missing names, invalid stock
  values) is only partially guarded (`Math.abs`, etc.), not properly
  rejected with clear validation errors.
- **Why deferred:** N/A — fixed as part of Product Module implementation.
- **Risk Level:** Medium
- **Planned Milestone:** Product Module
- **Status:** Completed (Module 3 — Product Management)

---

## 13. Product deletion has no safeguard

- **Description:** `deleteProduct` permanently removes any product
  regardless of whether it's currently active/visible to customers.
- **Why deferred:** N/A — fixed as part of Product Module implementation.
- **Risk Level:** Medium
- **Planned Milestone:** Product Module
- **Status:** Completed (Module 3 — Product Management)
