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
| Products        | 🟨 Testing / QA | 0%       |
| Image Upload    | ⬜ Not Started | 0%       |
| Cart            | ⬜ Not Started | 0%       |
| Orders          | ⬜ Not Started | 0%       |
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

🟨 Testing
