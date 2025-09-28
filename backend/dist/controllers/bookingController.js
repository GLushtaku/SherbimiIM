"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.bookingController = {
    //GET /api/bookings = get all bookings
    getAllBookings: async (req, res) => {
        try {
            const { date, limit } = req.query;
            // Get clientId from session
            const clientId = req.session.userId;
            if (!clientId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const whereClause = {
                clientId: clientId, // Only show bookings for the current user
            };
            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                whereClause.start = {
                    gte: startDate,
                    lt: endDate,
                };
            }
            console.log("Fetching bookings for clientId:", clientId);
            console.log("Where clause:", whereClause);
            const bookings = await prisma.booking.findMany({
                where: whereClause,
                take: limit ? parseInt(limit) : undefined,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            durationMinutes: true,
                        },
                    },
                    employee: {
                        select: {
                            id: true,
                            position: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    start: "asc",
                },
            });
            console.log("Found bookings:", bookings.length);
            res.json(bookings);
        }
        catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ error: "Failed to fetch bookings" });
        }
    },
    //GET /api/bookings/{id} = get booking by id
    getBookingById: async (req, res) => {
        try {
            const { id } = req.params;
            const booking = await prisma.booking.findUnique({
                where: { id },
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            durationMinutes: true,
                        },
                    },
                    employee: {
                        select: {
                            id: true,
                            position: true,
                            name: true,
                        },
                    },
                },
            });
            if (!booking) {
                return res.status(404).json({ error: "Booking not found" });
            }
            res.json(booking);
        }
        catch (error) {
            console.error("Error fetching booking:", error);
            res.status(500).json({ error: "Failed to fetch booking" });
        }
    },
    //POST /api/bookings = create new booking
    createBooking: async (req, res) => {
        try {
            const { serviceId, employeeId, start, end, status = "PENDING", } = req.body;
            // Get clientId from session
            const clientId = req.session.userId;
            if (!clientId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            // Validate required fields
            if (!serviceId || !employeeId || !start || !end) {
                return res.status(400).json({
                    error: "Missing required fields: serviceId, employeeId, start, end",
                });
            }
            // Check for existing bookings at the same time
            const existingBooking = await prisma.booking.findFirst({
                where: {
                    clientId: clientId,
                    start: {
                        gte: new Date(start),
                        lt: new Date(end),
                    },
                    status: {
                        in: ["PENDING", "CONFIRMED"],
                    },
                },
            });
            if (existingBooking) {
                return res.status(409).json({
                    error: "You already have a booking at this time. Please choose a different time slot.",
                });
            }
            const booking = await prisma.booking.create({
                data: {
                    clientId,
                    serviceId,
                    employeeId,
                    start: new Date(start),
                    end: new Date(end),
                    status: status,
                },
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            durationMinutes: true,
                        },
                    },
                    employee: {
                        select: {
                            id: true,
                            position: true,
                            name: true,
                        },
                    },
                },
            });
            res.status(201).json(booking);
        }
        catch (error) {
            console.error("Error creating booking:", error);
            console.error("Request body:", req.body);
            console.error("Session data:", {
                userId: req.session.userId,
                userRole: req.session.userRole,
            });
            res.status(500).json({ error: "Failed to create booking" });
        }
    },
    updateBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const { start, end, status } = req.body;
            const updateData = {};
            if (start !== undefined)
                updateData.start = new Date(start);
            if (end !== undefined)
                updateData.end = new Date(end);
            if (status !== undefined)
                updateData.status = status;
            const booking = await prisma.booking.update({
                where: { id },
                data: updateData,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            durationMinutes: true,
                        },
                    },
                    employee: {
                        select: {
                            id: true,
                            position: true,
                            name: true,
                        },
                    },
                },
            });
            res.json(booking);
        }
        catch (error) {
            console.error("Error updating booking:", error);
            res.status(500).json({ error: "Failed to update booking" });
        }
    },
    // DELETE /api/bookings/:id - Delete booking
    deleteBooking: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.booking.delete({
                where: { id },
            });
            res.json({ message: "Booking deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting booking:", error);
            res.status(500).json({ error: "Failed to delete booking" });
        }
    },
    // POST /api/bookings/availability - Check availability
    checkAvailability: async (req, res) => {
        try {
            const { employeeId, serviceId, date } = req.body;
            // Get clientId from session
            const clientId = req.session.userId;
            if (!clientId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            if (!employeeId || !serviceId || !date) {
                return res
                    .status(400)
                    .json({ error: "Employee ID, service ID, and date are required" });
            }
            // Get service duration
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
                select: { durationMinutes: true },
            });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            // Get existing bookings for the day
            const existingBookings = await prisma.booking.findMany({
                where: {
                    employeeId,
                    start: {
                        gte: startDate,
                        lt: endDate,
                    },
                    status: {
                        in: ["PENDING", "CONFIRMED"],
                    },
                },
                select: {
                    start: true,
                    clientId: true,
                    serviceId: true,
                },
            });
            // Generate all time slots (simplified - every hour from 9 AM to 5 PM)
            const allSlots = [];
            const availableSlots = [];
            const reservedSlots = [];
            const startHour = 9;
            const endHour = 17;
            for (let hour = startHour; hour < endHour; hour++) {
                const slotTime = new Date(startDate);
                slotTime.setHours(hour, 0, 0, 0);
                // Check if this slot conflicts with existing bookings
                const hasConflict = existingBookings.some((booking) => {
                    const bookingTime = new Date(booking.start);
                    return (Math.abs(bookingTime.getTime() - slotTime.getTime()) <
                        service.durationMinutes * 60 * 1000);
                });
                // Check if this slot is already booked by the current user for the same service
                const isBookedByCurrentUser = existingBookings.some((booking) => {
                    const bookingTime = new Date(booking.start);
                    return (booking.clientId === clientId &&
                        booking.serviceId === serviceId &&
                        Math.abs(bookingTime.getTime() - slotTime.getTime()) <
                            service.durationMinutes * 60 * 1000);
                });
                const slotData = {
                    time: slotTime.toISOString(),
                    available: !hasConflict && !isBookedByCurrentUser,
                };
                allSlots.push(slotData);
                if (hasConflict || isBookedByCurrentUser) {
                    reservedSlots.push(slotTime.toISOString());
                }
                else {
                    availableSlots.push(slotTime.toISOString());
                }
            }
            res.json({
                availableSlots,
                reservedSlots,
                allSlots,
            });
        }
        catch (error) {
            console.error("Error checking availability:", error);
            res.status(500).json({ error: "Failed to check availability" });
        }
    },
};
