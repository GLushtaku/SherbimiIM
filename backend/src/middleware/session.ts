import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Extend Request interface to include business data
declare global {
  namespace Express {
    interface Request {
      businessId?: string;
      business?: {
        id: string;
        name: string;
        ownerId: string;
      };
    }
  }
}

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

// Enhanced middleware to get business data and add it to request
export const getBusinessData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = req.session as any;
    if (!session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get business data with more information
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.userId,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: "Business not found for this user",
      });
    }

    // Add business data to request object
    req.businessId = business.id;
    req.business = business;
    next();
  } catch (error) {
    console.error("Error getting business data:", error);
    res.status(500).json({ error: "Failed to get business information" });
  }
};

// Backward compatibility - keep the old function name
export const getBusinessId = getBusinessData;

// Middleware to verify business ownership of a resource
export const verifyBusinessOwnership = (
  resourceType: "service" | "employee"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      if (!id) {
        return res.status(400).json({ error: "Resource ID required" });
      }

      let resource;

      if (resourceType === "service") {
        resource = await prisma.service.findFirst({
          where: {
            id: id,
            businessId: businessId,
          },
          select: { id: true, businessId: true },
        });
      } else if (resourceType === "employee") {
        resource = await prisma.employee.findFirst({
          where: {
            id: id,
            businessId: businessId,
          },
          select: { id: true, businessId: true },
        });
      }

      if (!resource) {
        return res.status(404).json({
          error: `${resourceType} not found or you don't have permission to access it`,
        });
      }

      next();
    } catch (error) {
      console.error(`Error verifying ${resourceType} ownership:`, error);
      res
        .status(500)
        .json({ error: `Failed to verify ${resourceType} ownership` });
    }
  };
};

// Middleware to check if user owns the business (for business-specific operations)
export const requireBusinessOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.business) {
    return res.status(400).json({ error: "Business context required" });
  }

  if (req.session.userId !== req.business.ownerId) {
    return res.status(403).json({ error: "You don't own this business" });
  }

  next();
};

// Middleware to check if user has CLIENT role
export const requireClient = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.session.userRole !== "CLIENT") {
    return res.status(403).json({ error: "Client access required" });
  }

  next();
};

// Combined middleware for client operations
export const requireClientAccess = () => {
  return [requireAuth, requireClient];
};

// Combined middleware for business operations - replaces multiple middlewares
export const requireBusiness = (resourceType?: "service" | "employee") => {
  return [
    requireAuth,
    requireRole(["BUSINESS"]),
    getBusinessData,
    ...(resourceType ? [verifyBusinessOwnership(resourceType)] : []),
  ];
};
