// src/types/express/index.d.ts
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: Role | string; // pranon edhe string
    }

    interface Request {
      businessId?: string;
    }
  }
}

// Extend the session interface
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}
