const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never returned by a normal query, must opt in with .select("+password")
    },
    phone: {
      type: String,
      trim: true,
      // Only validated if a phone number is actually provided, since it stays optional
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^[0-9+\-\s]{7,15}$/.test(value);
        },
        message: "Please provide a valid phone number",
      },
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// HASH PASSWORD BEFORE SAVING (PRODUCTION SAFE)
// Only re-hashes if the password field was actually changed, so updating
// a user's name or phone doesn't accidentally re-hash an already-hashed password.
userSchema.pre("save", async function ( ) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Compares a plain-text password (from a login form) against the stored hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Extra safety net: even if something ever queries with .select("+password"),
// this ensures the hash never leaks out through res.json(user) or JSON.stringify(user).
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
