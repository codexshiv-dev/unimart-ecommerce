# 🚀 UNiMART Project Progress

> Project: UNiMART - Full Stack E-Commerce Platform
>
> Goal: Build a production-ready e-commerce application following industry-standard software development practices.
>
> Tech Stack:
>
> - Backend: Node.js, Express.js
> - Database: MongoDB Atlas + Mongoose
> - Authentication: JWT + HttpOnly Cookies
> - Frontend: (Upcoming)
> - Deployment: (Upcoming)

---

# 📊 Overall Progress

| Module          | Status        | Progress |
| --------------- | ------------- | -------- |
| Authentication  | ✅ Completed   | 100%     |
| Categories      | ✅ Completed | 100%       |
| Products        | ✅ Completed | 100%      |
| Image Upload    | ⬜ Not Started | 0%       |
| Cart            | ⬜ Not Started | 0%       |
| Orders          | ✅ Completed | 100%       |
| Customers       | ⬜ Not Started | 0%       |
| Admin Dashboard | ⬜ Not Started | 0%       |
| Frontend        | ⬜ Not Started | 0%       |
| Deployment      | ⬜ Not Started | 0%       |

---

# ✅ Module 1 — Authentication

## Status

✅ Completed

---

## Features Implemented

- User Registration
- Duplicate Email Protection
- Password Hashing using bcrypt
- JWT Authentication
- HttpOnly Cookie Authentication
- Login
- Logout
- Protected Routes
- User Validation
- MongoDB Atlas Integration
- Rate Limiting
- Global Error Handling

---

## API Endpoints

| Method | Endpoint | Status |
|---------|----------|--------|
| POST | /api/auth/register | ✅ |
| POST | /api/auth/login | ✅ |
| POST | /api/auth/logout | ✅ |
| GET | /api/auth/me | ✅ |

---

## Security Features

- Password Hashing (bcrypt)
- JWT Authentication
- HttpOnly Cookies
- Duplicate Email Prevention
- Input Validation
- Protected Routes
- Account Enumeration Protection
- Rate Limiting

---

## Testing Completed

### Registration

- ✅ Register New User
- ✅ Duplicate Registration

### Login

- ✅ Correct Login
- ✅ Wrong Password
- ✅ Invalid Email

### JWT

- ✅ JWT Generation
- ✅ JWT Decode
- ✅ JWT Verification
- ✅ Invalid JWT Rejected

### Cookies

- ✅ Cookie Creation
- ✅ Cookie Deletion
- ✅ Cookie Authentication

### Protected Routes

- ✅ Access /me
- ✅ Access After Logout

### Validation

- ✅ Empty Name
- ✅ Invalid Email
- ✅ Short Password
- ✅ Missing Email
- ✅ Missing Password

### Security

- ✅ Rate Limiting (429)

---

## Bugs Fixed

### Bug #1

**Issue**

Mongoose 9 async middleware threw:

```
TypeError: next is not a function
```

**Cause**

Mixed async middleware with next() callback.

**Solution**

Removed next() from async middleware.

Old:

```javascript
userSchema.pre("save", async function (next) {
    ...
    next();
});
```

New:

```javascript
userSchema.pre("save", async function () {
    ...
});
```

Status:

✅ Fixed

---

### Bug #2

**Issue**

MongoDB Atlas Connection Error

```
querySrv ECONNREFUSED
```

**Cause**

Node.js DNS resolver was using

```
127.0.0.1
```

instead of a public DNS server.

**Temporary Solution**

```javascript
const dns = require("dns");

dns.setServers(["8.8.8.8"]);
```

Status:

✅ Working

Future Action:

Remove after local DNS configuration is fixed.

---

# 📚 Lessons Learned

- JWT Authentication Flow
- HttpOnly Cookies
- Express Middleware
- MongoDB Atlas
- Thunder Client Testing
- Password Hashing
- Route Protection
- API Validation
- Rate Limiting
- Professional API Testing Workflow

---

# 📝 Development Workflow

Every module follows this process:

1. Requirements
2. Database Design
3. API Design
4. Folder Structure
5. Implementation
6. Manual Testing
7. Bug Fixing
8. Security Review
9. Freeze Module
10. Git Commit

---

# ✅ Module 2 — Categories

## Status

✅ Completed

---

## Features Implemented

- Create Category
- Get All Categories
- Get Category by ID
- Get Category by Slug
- Update Category
- Delete Category
- Auto Slug Generation
- Category Validation
- Admin Authorization
- Public Category Listing
- Product → Category Reference Migration

---

## Testing Completed

✅ Create Category

✅ Duplicate Category

✅ Get Categories

✅ Get Category by ID

✅ Get Category by Slug

✅ Update Category

✅ Delete Category

✅ Delete Non-existing Category

✅ Block Delete When Products Exist

✅ Customer Cannot Create Category

✅ Missing Token

✅ Invalid Category Validation

---

## Bugs Fixed

- Fixed Mongoose pre("validate") middleware
- Removed Product-old import
- Fixed slug generation
- Fixed authorization middleware

Status:

✅ Frozen


# ✅ Module 3 — Product Management & Security

## Status

✅ Completed

---

## Features Implemented

- Create Product
- Get All Products
- Get Single Product
- Update Product
- Delete Product
- Product Status Management (Active / Inactive)
- SKU Auto Generation
- Category Validation
- Product Pagination
- Product Search
- Product Filtering
- Product Sorting
- Admin Authorization
- Manual Input Validation

---

## API Endpoints

| Method | Endpoint | Access | Status |
|---------|----------|--------|--------|
| GET | /api/products | Public | ✅ |
| GET | /api/products/:id | Public | ✅ |
| POST | /api/products | Admin | ✅ |
| PUT | /api/products/:id | Admin | ✅ |
| PATCH | /api/products/:id | Admin | ✅ |
| DELETE | /api/products/:id | Admin | ✅ |

---

## Security Features

- Admin-only product management
- Protected write routes
- Category existence validation
- Product input validation
- Safe product deletion
- Duplicate SKU protection
- Pagination limits
- Search sanitization

---

## Testing Completed

### Public Access

- ✅ Get All Products
- ✅ Get Single Product

### Authorization

- ✅ No Token → 401
- ✅ Customer Role → 403
- ✅ Admin Role → 200

### Product Creation

- ✅ Valid Product
- ✅ Invalid Category
- ✅ Missing Name
- ✅ Missing Price
- ✅ Negative Price
- ✅ Invalid Stock
- ✅ Auto SKU Generation

### Product Update

- ✅ Valid Update
- ✅ Invalid Category
- ✅ Invalid Price
- ✅ Invalid Stock

### Product Deletion

- ✅ Cannot Delete Active Product
- ✅ Delete After Status Changed To Inactive

### Pagination & Search

- ✅ Pagination
- ✅ Search
- ✅ Filtering
- ✅ Sorting

---

## Bugs Fixed

### Bug #1

**Issue**

Product routes were publicly writable.

**Cause**

Authorization middleware was missing.

**Solution**

Added:

```javascript
protect
authorize("admin")
```

to all write routes.

Status:

✅ Fixed

---

### Bug #2

**Issue**

Updating a product accepted nonexistent category IDs.

**Cause**

`updateProduct()` didn't validate category references.

**Solution**

Added category existence validation before updating.

Status:

✅ Fixed

---

### Bug #3

**Issue**

Deleting active products could accidentally remove products visible to customers.

**Cause**

No deletion safeguard existed.

**Solution**

Products must first be marked `inactive` before deletion.

Status:

✅ Fixed

---

### Bug #4

**Issue**

Product validation accepted invalid values such as negative prices and stock.

**Cause**

Only minimal validation existed.

**Solution**

Added comprehensive manual validation with clear error messages.

Status:

✅ Fixed

---

### Bug #5

**Issue**

SKU unique index could throw duplicate-key errors when SKU was omitted.

**Cause**

Unique index did not handle missing values safely.

**Solution**

Updated SKU index configuration.

Status:

✅ Fixed

---

## Lessons Learned

- REST API design
- Product CRUD architecture
- Pagination
- Search implementation
- Filtering & sorting
- Role-based authorization
- Manual request validation
- Mongoose schema validation
- Category relationships
- Safe deletion strategies

---

## Module Result

**All planned Product module test cases passed successfully.**

---

## Current Milestone

✅ Authentication

✅ Categories

✅ Product Management & Security

Ready to begin Order Management & Security.



# ✅ Module 4 — Order Management & Security

## Status

✅ Completed

---

## Features Implemented

- Guest Checkout
- Create Order
- Get All Orders
- Update Order Status
- Admin Authorization
- Input Validation
- Controller Refactoring
- Route Cleanup

---

## API Endpoints

| Method | Endpoint | Access | Status |
|---------|----------|--------|--------|
| POST | /api/orders | Public | ✅ |
| GET | /api/orders | Admin | ✅ |
| PATCH | /api/orders/:id | Admin | ✅ |

---

## Security Features

- Guest checkout preserved
- Admin-only order management
- Protected routes
- Role-based authorization
- Manual request validation

---

## Testing Completed

### Guest Checkout

- ✅ Create Order

### Authorization

- ✅ No Token → 401
- ✅ Customer → 403
- ✅ Admin → 200

### Validation

- ✅ Missing Customer Name
- ✅ Empty Cart
- ✅ Invalid Quantity
- ✅ Invalid Price
- ✅ Invalid Total
- ✅ Invalid Status

### Order Management

- ✅ Update Status

---

## Bugs Fixed

### Bug #1

Issue

Cause

Mongoose 9 removed callback-style middleware.

Solution

Removed `next()` from hooks.

Status

✅ Fixed

---

### Bug #2

Issue

Cause

`orderId` was generated in `pre("save")`, but validation runs before `pre("save")`.

Solution

Moved generator to `pre("validate")`.

Status

✅ Fixed

---

## Lessons Learned

- Guest checkout architecture
- Route authorization
- Controller refactoring
- Mongoose middleware lifecycle
- Manual validation
- API security

---

## Module Result

**11 / 11 Test Cases Passed**

---

## Current Milestone

✅ Authentication

✅ Categories

✅ Products

✅ Order Management & Security

Ready for Image Upload Module.


# ✅ Module 5 — Cloudinary Image Upload

## Status

🟩 Complete

## Features

- Cloudinary integration
- Secure image upload
- Multi-image upload (max 5)
- Multer memory storage
- Image type validation
- Image size validation (5MB)
- Admin-only upload
- Manual image deletion
- Cascade image deletion when product is deleted
- Product schema updated to store:
  - url
  - publicId

## Testing

✅ Upload image
✅ Upload multiple images
✅ Invalid file type
✅ Maximum file count
✅ File size validation
✅ Product creation using uploaded images
✅ Image validation
✅ Manual delete
✅ Cascade delete

## Deferred

- Upload rate limiter stress test
- Duplicate image detection
- Primary image support
