# Frontend Integration Notes — Cloudinary Image Module

This document exists because the Cloudinary module was implemented
backend-only, by design. Nothing here has been applied to the frontend yet -
it's a checklist for whoever picks up the dedicated Frontend module.

---

## 1. `Product.images` changed shape

**Before:**
```json
"images": ["https://res.cloudinary.com/.../photo1.jpg", "https://res.cloudinary.com/.../photo2.jpg"]
```

**After:**
```json
"images": [
  { "url": "https://res.cloudinary.com/.../photo1.jpg", "publicId": "unimart/products/abc123" },
  { "url": "https://res.cloudinary.com/.../photo2.jpg", "publicId": "unimart/products/def456" }
]
```

**Every place that currently does something like:**
```js
<img src={product.images[0]} />
// or
product.images.map(img => <img src={img} />)
```
**must become:**
```js
<img src={product.images[0].url} />
// or
product.images.map(img => <img src={img.url} />)
```

Likely affected (not yet verified against actual file contents):
- `frontend/js/components/gallery.js`
- `frontend/js/components/productCard.js`
- `frontend/js/components/relatedProducts.js`
- `frontend/js/pages/product.js`
- `frontend/js/cart.js` (if it snapshots a product image URL when adding to cart)
- `admin/js/product-modal.js` (also needs the upload flow change below)
- Admin product listing/table JS (if it shows a thumbnail column)

`publicId` is backend-internal (needed for deletion) and should generally
not be rendered anywhere in the UI - it's not a user-facing value.

---

## 2. New upload flow for the admin product form

The admin can no longer submit a bare list of image URLs typed by hand (that
was never really wired to anything real before this module anyway). The new
flow is:

1. Admin selects up to 5 image files in the product form.
2. Frontend uploads them **first**, separately from the product form submit:
   ```
   POST /api/uploads/images
   Content-Type: multipart/form-data
   Field name: "images" (up to 5 files, 5MB max each, jpeg/png/webp only)
   ```
   Response:
   ```json
   { "success": true, "data": [{ "url": "...", "publicId": "..." }, ...] }
   ```
3. Frontend includes that returned array directly as `images` in the
   subsequent `POST /api/products` or `PUT/PATCH /api/products/:id` call -
   those endpoints are unchanged, they just now expect objects instead of
   strings in `images`.

## 3. New single-image deletion endpoint

```
DELETE /api/uploads/image
Body: { "publicId": "unimart/products/abc123" }
```

This only removes the file from Cloudinary. If that image is still listed in
a product's `images` array, the frontend must **also** send an updated
`images` array (with that entry removed) via a normal product update call -
the two operations are intentionally not linked automatically.

## 4. Cascade deletion needs no frontend changes

When a product is permanently deleted (already requires `status: "inactive"`
first, unchanged from the Product module), its Cloudinary images are now
automatically deleted server-side. No frontend action needed for this part.

## 5. Local test data warning

Any local MongoDB product documents created before this module (with the old
string-array `images` format) may fail to load correctly under the new
schema. Clear local test product data before testing against the updated
backend - same caution that applied during the Category migration.
