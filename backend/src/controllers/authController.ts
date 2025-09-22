import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        password,
        phoneNumber,
        role = "CLIENT",
        businessData,
      } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Name, email, and password are required",
        });
      }

      if (role === "BUSINESS" && !businessData) {
        return res.status(400).json({
          error: "Business data is required for business role",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phoneNumber,
          role: role as "CLIENT" | "BUSINESS",
          businessProfile:
            role === "BUSINESS"
              ? {
                  create: {
                    companyName: businessData.companyName,
                    businessLicense: businessData.businessLicense,
                    taxId: businessData.taxId,
                    yearsInBusiness: businessData.yearsInBusiness,
                    emergencyContact: businessData.emergencyContact,
                    alternatePhone: businessData.alternatePhone,
                    acceptsWalkIns: businessData.acceptsWalkIns || false,
                    appointmentRequired:
                      businessData.appointmentRequired !== false,
                    maxBookingsPerDay: businessData.maxBookingsPerDay,
                  },
                }
              : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      });

      // Create business record separately if role is BUSINESS
      if (role === "BUSINESS") {
        await prisma.business.create({
          data: {
            ownerId: user.id,
            name: businessData.companyName,
            description: businessData.description,
            phoneNumber: businessData.phoneNumber || phoneNumber,
            address: businessData.address,
            city: businessData.city,
            country: businessData.country,
            postalCode: businessData.postalCode,
            website: businessData.website,
            category: businessData.category,
          },
        });
      }
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.status(201).json({
        message: "User registered successfully",
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Failed to register user",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // POST /api/auth/login - Login user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password, userType } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required",
        });
      }

      if (!userType) {
        return res.status(400).json({
          error: "User type is required (client or business)",
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password || ""
      );

      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }
      const expectedRole =
        userType.toUpperCase() === "BUSINESS" ? "BUSINESS" : "CLIENT";
      if (user.role !== expectedRole) {
        return res.status(403).json({
          error: "Invalid email or password",
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Failed to login",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // POST /api/auth/logout - Logout user
  logout: async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  },

  // GET /api/auth/me - Get current user
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get current user" });
    }
  },
};
