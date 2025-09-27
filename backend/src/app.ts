import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import businessRoutes from "./routes/business";
import authRoutes from "./routes/auth";
import serviceRoutes from "./routes/services";
// import serviceRoutes from "./routes/services";
import session from "express-session";
import categoriesRoute from "./routes/categories";
import employeesRoute from "./routes/employee";
import bookingRoutes from "./routes/booking";
import authorRoute from "./routes/author";
import booksRoute from "./routes/books";
import statsRoutes from "./routes/stats";
// import categoryRoutes from "./routes/categories";
// import oauthRoutes from "./routes/oauth";
// import employeeRoutes from "./routes/employee";
// import bookingRoutes from "./routes/bookings";
// import businessServiceRoutes from "./routes/businessServices";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001 || 3002;

// Initialize Prisma
const prisma = new PrismaClient();

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

// Test connection on startup
testDatabaseConnection();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: 1000 * 60 * 60 * 24, // 1 ditë
      sameSite: "lax", // Set to lax for development
    },
  })
);

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
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoriesRoute);
app.use("/api/employees", employeesRoute);
app.use("/api/bookings", bookingRoutes);
app.use("/api/authors", authorRoute);
app.use("/api/books", booksRoute);
app.use("/api/stats", statsRoutes);
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
