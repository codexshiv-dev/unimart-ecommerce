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
- **Status:** Completed (Order Management & Security Module)

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
- **Status:** Completed (Order Management & Security Module) — logic consolidated into `orderController.js`, `orderRoutes.js` is now a thin wiring file matching the Products/Categories pattern

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
- **Status:** Completed (Checkout Module — `Order.user` added, optional)

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

---

## 14. Order pricing trusts client-submitted values

- **Description:** `createOrder` validates that item prices and `totalAmount`
  are positive numbers, but does not verify they match the real, current
  price of each product in the `Product` collection. A request could submit
  a full cart of expensive items with a low `totalAmount` and low per-item
  prices, and the server would accept it as-is.
- **Why deferred:** A proper fix means calculating the order total
  server-side from `Product.price` at the moment of order creation, which
  is a pricing-authority decision that belongs together with the broader
  Checkout redesign (cart integrity, stock checks, and pricing all need to
  be considered as one unit) - not bolted on as a partial check now.
- **Risk Level:** Medium-High (price tampering)
- **Planned Milestone:** Checkout Module
- **Status:** Completed (Checkout Module — `POST /api/checkout` resolves
  price/status/stock server-side for every item; old client-trusting
  `POST /api/orders` removed entirely, not just bypassed)

---

## 15. API response shape is inconsistent across resources

- **Description:** `authController.js`, `categoryController.js`, and
  `productController.js` all return `{ success, data, message }`-shaped
  JSON. `orderController.js` returns raw objects/arrays with `{ message }`
  only on error, no `success` field - the original shape, deliberately
  preserved during the Order module to avoid breaking whatever frontend
  code already parses order responses in that format.
- **Why deferred:** Standardizing this means touching frontend JS
  (checkout, admin orders page) that hasn't been reviewed yet. Not safe to
  change as a side effect of a security-focused module.
- **Risk Level:** Low (consistency/maintainability, not a functional bug)
- **Planned Milestone:** A dedicated API standardization pass, or naturally
  during the Checkout Module when order-handling frontend code is touched anyway
- **Status:** Open

---

## 16. Frontend not yet updated for the `Product.images` schema change

- **Description:** The Cloudinary module changed `Product.images` from
  `[String]` to `[{ url, publicId }]`. This was implemented backend-only by
  deliberate decision - the frontend still expects the old string-array
  shape everywhere it renders product images, and the admin panel has no
  working upload flow wired to the new endpoints yet.
- **Why deferred:** The Frontend module will redesign the relevant UI
  anyway; updating frontend files now (before that redesign) would mean
  doing the work twice. Full details of exactly what must change are
  recorded in `docs/FRONTEND_INTEGRATION_NOTES.md`.
- **Risk Level:** Medium (storefront/admin image rendering will be broken
  until this is addressed - not a security risk, but a real functional gap)
- **Planned Milestone:** Frontend Module
- **Status:** Open

---

## 17. Cloudinary cleanup failures during product deletion are silent

- **Description:** `deleteProduct`'s cascade cleanup calls
  `cloudinary.uploader.destroy()` for each image and swallows individual
  failures (logged to the server console only) so that one failed image
  deletion doesn't block the product record itself from being deleted.
  There's currently no admin-facing indication if an image failed to clean
  up, so a small number of orphaned files could still accumulate silently
  over time.
- **Why deferred:** Acceptable for now given expected low volume; a proper
  fix (e.g., a retry queue or an admin-visible cleanup log) is more naturally
  part of a broader admin activity/audit logging system, which doesn't exist
  yet and is out of scope for this module.
- **Risk Level:** Low
- **Planned Milestone:** Whenever an admin activity/audit log is introduced
- **Status:** Open

---

## 18. No duplicate image detection

- **Description:** Uploading the same file twice creates two separate
  Cloudinary assets with different `publicId`s rather than recognizing or
  reusing the existing one.
- **Why deferred:** This is Cloudinary's standard default behavior, and it's
  the correct default for a product catalog — two different products may
  legitimately share a stock photo without wanting to accidentally link or
  overwrite one shared asset. Not a bug; a possible future enhancement only
  if storage costs become a concern.
- **Risk Level:** Low
- **Planned Milestone:** Future Enhancement (post-launch, if ever needed)
- **Status:** Open

---

## 19. No primary image or explicit image ordering

- **Description:** `Product.images` has no concept of which image is the
  "primary" thumbnail or an explicit display order — order is currently just
  whatever sequence they were uploaded/stored in.
- **Why deferred:** Not required for MVP; a real implementation (drag-and-drop
  reordering, a `isPrimary` flag) is a UI-driven feature that belongs with
  the Frontend module's redesign, not this backend infrastructure module.
- **Risk Level:** Low
- **Planned Milestone:** Future Enhancement / Frontend Module
- **Status:** Open

---

## 20. No image processing pipeline (compression, cropping, AI background removal)

- **Description:** Images are uploaded to Cloudinary as-is, with no
  automated optimization, cropping, or background-removal step.
- **Why deferred:** Cloudinary supports these via transformation URLs and
  add-ons, but introducing them now adds complexity and potential cost with
  no immediate business need. Not required for launch.
- **Risk Level:** Low
- **Planned Milestone:** Future Enhancement (evaluate post-launch based on
  actual product photo quality/needs)
- **Status:** Open

---

## 21. Upload rate limiter stress test not performed

- **Description:** `uploadLimiter` (30 requests / 15 min) is attached to
  `POST /api/uploads/images`, but the actual 31st-request-gets-429 behavior
  was not run during Cloudinary module QA - deliberately deferred as
  time-consuming and low-risk given the middleware is the same
  already-proven pattern used on the Auth routes.
- **Why deferred:** Low risk given it's a copy of an already-tested pattern;
  time-consuming to test manually.
- **Risk Level:** Low
- **Planned Milestone:** Final QA pass before deployment
- **Status:** Open

---

## 22. Cart does not validate against product stock

- **Description:** `addItem` and `syncCart` accept any positive quantity
  (up to the 99-per-item cap) without checking `Product.stockQuantity`. A
  cart is treated as intent, not a reservation.
- **Why deferred:** Real stock enforcement belongs at the point of actual
  purchase, not at add-to-cart time - same reasoning already applied to the
  order pricing-trust issue (#14). Both are the same underlying principle:
  client/cart state isn't authoritative, the database is, and that needs to
  be enforced right before a purchase is finalized, not earlier.
- **Risk Level:** Medium
- **Planned Milestone:** Checkout Module (alongside #14)
- **Status:** Completed (Checkout Module — atomic `findOneAndUpdate` stock
  decrement per item, inside a transaction with the rest of the order)

---

## 23. Checkout has no duplicate-submission (idempotency) protection

- **Description:** A double-click or network retry on `POST /api/checkout`
  would currently create two separate orders and decrement stock twice -
  there's no idempotency key or dedup mechanism.
- **Why deferred:** A correct fix (client-generated idempotency key + a
  server-side dedup lookup) is a real feature, not proportional to bundle
  into this pass. The interim mitigation is frontend-side (disable the
  submit button after first click), which belongs to the Frontend Module.
  Flagged explicitly here rather than silently left out, since it's
  financial-correctness-adjacent.
- **Risk Level:** Medium
- **Planned Milestone:** Frontend Module (interim), true fix TBD
- **Status:** Open
- **Status:** Open

