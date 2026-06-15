require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet"); 
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const app = express();

// 1. SETUP FIRST
app.use(helmet()); 

// 2. PARSE JSON FIRST (Crucial: Data must exist before it can be sanitized)
app.use(express.json({ limit: '10kb' })); 
// Add this block directly above app.use(mongoSanitize())
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: req.query,
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});



// 3. SANITIZE SECOND
app.use(mongoSanitize()); 

// 4. RATE LIMITER
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please slow down." }
});
app.use("/api/", limiter);

// 5. CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

app.use(cors({
    origin: function (origin, callback) {
        // ALLOW requests with no origin (like mobile apps, postman, or direct browser URLs)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || 
            origin.includes("localhost") || 
            origin.includes("127.0.0.1")) {
            callback(null, true);
        } else {
            // Instead of throwing an Error (which crashes the request), 
            // return false to simply deny access cleanly
            callback(null, false);
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

// 🔗 MONGODB CONNECTION
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};
connectDB();

// 🚀 ROUTES
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

// 4. GLOBAL ERROR HANDLER (Don't let errors leak internal details!)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "An internal server error occurred." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});