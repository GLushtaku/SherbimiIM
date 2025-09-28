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
                    yearsInBusiness: businessData.yearsInBusiness
                      ? parseInt(businessData.yearsInBusiness)
                      : null,
                    emergencyContact: businessData.emergencyContact,
                    alternatePhone: businessData.alternatePhone,
                    acceptsWalkIns: businessData.acceptsWalkIns || false,
                    appointmentRequired:
                      businessData.appointmentRequired !== false,
                    maxBookingsPerDay: businessData.maxBookingsPerDay
                      ? parseInt(businessData.maxBookingsPerDay)
                      : null,
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
          businessProfile: {
            select: {
              id: true,
              companyName: true,
              businessLicense: true,
              taxId: true,
              yearsInBusiness: true,
              emergencyContact: true,
              alternatePhone: true,
              acceptsWalkIns: true,
              appointmentRequired: true,
              maxBookingsPerDay: true,
            },
          },
          clientProfile: {
            select: {
              id: true,
              dateOfBirth: true,
              gender: true,
              emergencyContact: true,
              preferredContact: true,
              notificationPreferences: true,
              totalBookings: true,
              loyaltyPoints: true,
            },
          },
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

  // PUT /api/auth/profile - Update user profile
  updateProfile: async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { name, phoneNumber, profileData } = req.body;

      // Update basic user information
      const updatedUser = await prisma.user.update({
        where: { id: req.session.userId },
        data: {
          name,
          phoneNumber,
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

      // Update role-specific profile data
      if (profileData) {
        if (updatedUser.role === "BUSINESS" && profileData.businessProfile) {
          await prisma.businessProfile.upsert({
            where: { userId: req.session.userId },
            update: {
              companyName: profileData.businessProfile.companyName,
              businessLicense: profileData.businessProfile.businessLicense,
              taxId: profileData.businessProfile.taxId,
              yearsInBusiness: profileData.businessProfile.yearsInBusiness,
              emergencyContact: profileData.businessProfile.emergencyContact,
              alternatePhone: profileData.businessProfile.alternatePhone,
              acceptsWalkIns: profileData.businessProfile.acceptsWalkIns,
              appointmentRequired:
                profileData.businessProfile.appointmentRequired,
              maxBookingsPerDay: profileData.businessProfile.maxBookingsPerDay,
            },
            create: {
              userId: req.session.userId,
              companyName: profileData.businessProfile.companyName,
              businessLicense: profileData.businessProfile.businessLicense,
              taxId: profileData.businessProfile.taxId,
              yearsInBusiness: profileData.businessProfile.yearsInBusiness,
              emergencyContact: profileData.businessProfile.emergencyContact,
              alternatePhone: profileData.businessProfile.alternatePhone,
              acceptsWalkIns: profileData.businessProfile.acceptsWalkIns,
              appointmentRequired:
                profileData.businessProfile.appointmentRequired,
              maxBookingsPerDay: profileData.businessProfile.maxBookingsPerDay,
            },
          });
        } else if (updatedUser.role === "CLIENT" && profileData.clientProfile) {
          await prisma.clientProfile.upsert({
            where: { userId: req.session.userId },
            update: {
              dateOfBirth: profileData.clientProfile.dateOfBirth
                ? new Date(profileData.clientProfile.dateOfBirth)
                : null,
              gender: profileData.clientProfile.gender,
              emergencyContact: profileData.clientProfile.emergencyContact,
              preferredContact: profileData.clientProfile.preferredContact,
              notificationPreferences:
                profileData.clientProfile.notificationPreferences,
            },
            create: {
              userId: req.session.userId,
              dateOfBirth: profileData.clientProfile.dateOfBirth
                ? new Date(profileData.clientProfile.dateOfBirth)
                : null,
              gender: profileData.clientProfile.gender,
              emergencyContact: profileData.clientProfile.emergencyContact,
              preferredContact: profileData.clientProfile.preferredContact,
              notificationPreferences:
                profileData.clientProfile.notificationPreferences,
            },
          });
        }
      }

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // PUT /api/auth/password - Update password
  updatePassword: async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required",
        });
      }

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: { password: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password || ""
      );

      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: req.session.userId },
        data: { password: hashedNewPassword },
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({
        error: "Failed to update password",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
