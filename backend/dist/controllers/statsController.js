"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.statsController = {
    // GET /api/stats - Get platform statistics
    getStats: async (req, res) => {
        try {
            // Get all statistics in parallel for better performance
            const [businessCount, clientCount, categoryCount, bookingCount, activeBookingsCount, completedBookingsCount, totalServicesCount,] = await Promise.all([
                // Count businesses
                prisma.user.count({
                    where: { role: "BUSINESS" },
                }),
                // Count clients
                prisma.user.count({
                    where: { role: "CLIENT" },
                }),
                // Count active categories
                prisma.category.count({
                    where: { isActive: true },
                }),
                // Count total bookings
                prisma.booking.count(),
                // Count active/pending bookings
                prisma.booking.count({
                    where: {
                        status: {
                            in: ["PENDING", "CONFIRMED"],
                        },
                    },
                }),
                // Count completed bookings
                prisma.booking.count({
                    where: { status: "COMPLETED" },
                }),
                // Count total services
                prisma.service.count(),
            ]);
            // Calculate additional metrics
            const totalUsers = businessCount + clientCount;
            const completionRate = bookingCount > 0
                ? Math.round((completedBookingsCount / bookingCount) * 100)
                : 0;
            const stats = {
                businesses: businessCount,
                clients: clientCount,
                totalUsers,
                categories: categoryCount,
                totalBookings: bookingCount,
                activeBookings: activeBookingsCount,
                completedBookings: completedBookingsCount,
                totalServices: totalServicesCount,
                completionRate,
                // Additional useful metrics
                averageBookingsPerBusiness: businessCount > 0 ? Math.round(bookingCount / businessCount) : 0,
                averageServicesPerBusiness: businessCount > 0
                    ? Math.round(totalServicesCount / businessCount)
                    : 0,
            };
            res.json({ stats });
        }
        catch (error) {
            console.error("Error fetching statistics:", error);
            res.status(500).json({ error: "Failed to fetch statistics" });
        }
    },
    // GET /api/stats/dashboard - Get dashboard-specific stats (for businesses)
    getDashboardStats: async (req, res) => {
        try {
            const businessId = req.user?.businessId;
            if (!businessId) {
                return res.status(401).json({ error: "Business ID not found" });
            }
            const [businessBookings, businessServices, businessEmployees, recentBookings, monthlyBookings,] = await Promise.all([
                // Count bookings for this business
                prisma.booking.count({
                    where: {
                        service: {
                            businessId: businessId,
                        },
                    },
                }),
                // Count services for this business
                prisma.service.count({
                    where: { businessId },
                }),
                // Count employees for this business
                prisma.employee.count({
                    where: { businessId },
                }),
                // Get recent bookings (last 7 days)
                prisma.booking.count({
                    where: {
                        service: {
                            businessId: businessId,
                        },
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                // Get monthly bookings
                prisma.booking.count({
                    where: {
                        service: {
                            businessId: businessId,
                        },
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                }),
            ]);
            const stats = {
                totalBookings: businessBookings,
                totalServices: businessServices,
                totalEmployees: businessEmployees,
                recentBookings,
                monthlyBookings,
                // Calculate growth rates (you can implement this based on previous periods)
                bookingsGrowth: 0, // Placeholder
                servicesGrowth: 0, // Placeholder
            };
            res.json({ stats });
        }
        catch (error) {
            console.error("Error fetching dashboard statistics:", error);
            res.status(500).json({ error: "Failed to fetch dashboard statistics" });
        }
    },
};
