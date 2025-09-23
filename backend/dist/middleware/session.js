"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireBusiness = exports.requireBusinessOwnership = exports.verifyBusinessOwnership = exports.getBusinessId = exports.getBusinessData = exports.requireRole = exports.requireAuth = void 0;
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
// Enhanced middleware to get business data and add it to request
const getBusinessData = async (req, res, next) => {
    try {
        const session = req.session;
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
    }
    catch (error) {
        console.error("Error getting business data:", error);
        res.status(500).json({ error: "Failed to get business information" });
    }
};
exports.getBusinessData = getBusinessData;
// Backward compatibility - keep the old function name
exports.getBusinessId = exports.getBusinessData;
// Middleware to verify business ownership of a resource
const verifyBusinessOwnership = (resourceType) => {
    return async (req, res, next) => {
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
            }
            else if (resourceType === "employee") {
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
        }
        catch (error) {
            console.error(`Error verifying ${resourceType} ownership:`, error);
            res
                .status(500)
                .json({ error: `Failed to verify ${resourceType} ownership` });
        }
    };
};
exports.verifyBusinessOwnership = verifyBusinessOwnership;
// Middleware to check if user owns the business (for business-specific operations)
const requireBusinessOwnership = (req, res, next) => {
    if (!req.business) {
        return res.status(400).json({ error: "Business context required" });
    }
    if (req.session.userId !== req.business.ownerId) {
        return res.status(403).json({ error: "You don't own this business" });
    }
    next();
};
exports.requireBusinessOwnership = requireBusinessOwnership;
// Combined middleware for business operations - replaces multiple middlewares
const requireBusiness = (resourceType) => {
    return [
        exports.requireAuth,
        (0, exports.requireRole)(["BUSINESS"]),
        exports.getBusinessData,
        ...(resourceType ? [(0, exports.verifyBusinessOwnership)(resourceType)] : []),
    ];
};
exports.requireBusiness = requireBusiness;
