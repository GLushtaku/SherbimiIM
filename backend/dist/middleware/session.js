"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessId = exports.requireRole = exports.requireAuth = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
};
exports.requireAuth = requireAuth;
// Middleware to check if user has specific role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!req.session.userRole || !roles.includes(req.session.userRole)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware to get businessId from session and add it to request
const getBusinessId = async (req, res, next) => {
    try {
        const session = req.session;
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
        req.businessId = business.id;
        next();
    }
    catch (error) {
        console.error("Error getting business ID:", error);
        res.status(500).json({ error: "Failed to get business information" });
    }
};
exports.getBusinessId = getBusinessId;
