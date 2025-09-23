import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware to check if user is authenticated
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Middleware to check if user has specific role
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.session.userRole || !roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Middleware to get businessId from session and add it to request
export const getBusinessId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = req.session as any;
    if (!session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Gjej biznesin që i përket këtij përdoruesi
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.userId,
      },
      select: {
        id: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: "Business not found for this user",
      });
    }

    // Shto businessId në request object
    (req as any).businessId = business.id;
    next();
  } catch (error) {
    console.error("Error getting business ID:", error);
    res.status(500).json({ error: "Failed to get business information" });
  }
};
