"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
require("../types/express/index");
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
