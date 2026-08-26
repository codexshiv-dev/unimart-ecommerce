// testMongoConnection.js
// Run standalone from backend/: node testMongoConnection.js
// Completely isolated from server.js/Express - tests only whether the
// current MONGO_URI in .env can authenticate at all.

require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

// Same workaround already present in server.js (Technical Debt #1) - without
// this, the script fails at DNS resolution before ever attempting auth,
// which is a different problem and tells us nothing about the credential.
dns.setServers(["8.8.8.8"]);

const uri = process.env.MONGO_URI;

// Diagnostic logging that never prints the password itself - only shape,
// so this is safe to paste back if you need help interpreting it.
if (!uri) {
  console.error("❌ MONGO_URI is not set at all in .env");
  process.exit(1);
}

// Mask the credential segment (mongodb://user:PASSWORD@host) before logging
// anything about the URI's structure.
const masked = uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
console.log("MONGO_URI shape (password masked):", masked);
console.log("MONGO_URI length:", uri.length);
console.log(
  "MONGO_URI has whitespace/quotes at start or end:",
  /^["'\s]|["'\s]$/.test(uri)
);

console.log("\nAttempting connection...");

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("✅ Connected successfully - the credential itself is valid.");
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Connection failed.");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    // codeName specifically distinguishes "AuthenticationFailed" (bad
    // credential) from network-level failures like ENOTFOUND/ETIMEDOUT
    // (wrong host, IP not whitelisted, DNS issue).
    if (err.codeName) console.error("Error codeName:", err.codeName);
    process.exit(1);
  });
