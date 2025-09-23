"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const business_1 = __importDefault(require("./routes/business"));
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
// import serviceRoutes from "./routes/services";
const express_session_1 = __importDefault(require("express-session"));
const categories_1 = __importDefault(require("./routes/categories"));
const employee_1 = __importDefault(require("./routes/employee"));
// import categoryRoutes from "./routes/categories";
// import oauthRoutes from "./routes/oauth";
// import employeeRoutes from "./routes/employee";
// import bookingRoutes from "./routes/bookings";
// import businessServiceRoutes from "./routes/businessServices";
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Initialize Prisma
const prisma = new client_1.PrismaClient();
// Test database connection
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}
// Test connection on startup
testDatabaseConnection();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to false for development
        maxAge: 1000 * 60 * 60 * 24, // 1 ditë
        sameSite: "lax", // Set to lax for development
    },
}));
// Initialize passport after session (commented out for now)
// app.use(passport.initialize());
// app.use(passport.session());
// Routes
app.get("/", (req, res) => {
    res.json({ message: "Backend API is running!" });
});
// Debug session endpoint
app.get("/debug-session", (req, res) => {
    res.json({
        session: req.session,
        sessionID: req.sessionID,
        cookies: req.headers.cookie,
    });
});
// // Test session endpoint
// app.get("/test-session", (req, res) => {
//   if (req.session.userId) {
//     res.json({
//       message: "Session is working!",
//       userId: req.session.userId,
//       userRole: req.session.userRole,
//     });
//   } else {
//     res.json({
//       message: "No session found",
//       session: req.session,
//     });
//   }
// });
// API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/businesses", business_1.default);
app.use("/api/services", services_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/employees", employee_1.default);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/employee", employeeRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/business/services", businessServiceRoutes);
// Add OAuth routes
// app.use("/api/oauth", oauthRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on  http://localhost:${PORT}`);
});
// Graceful shutdown
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
