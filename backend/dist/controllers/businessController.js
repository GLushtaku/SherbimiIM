"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.businessController = {
    //GET /api/businesses => get all businesses
    getAllBusinesses: async (req, res) => {
        try {
            const businesses = await prisma.business.findMany();
            res.json(businesses);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    //GET /api/businesses/:id => get business by id
    getBusinessById: async (req, res) => {
        try {
            const { id } = req.params;
            const business = await prisma.business.findUnique({
                where: { id },
                include: {
                    services: true,
                    employees: true,
                },
            });
            if (!business) {
                return res.status(404).json({ error: "Business not found" });
            }
            res.json(business);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    createBusiness: async (req, res) => {
        try {
            const ownerId = req.session?.userId;
            if (!ownerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const { name, phoneNumber, description, address, city, country, postalCode, website, category, workingHours, } = req.body;
            if (!name || !phoneNumber) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const existing = await prisma.business.findFirst({
                where: {
                    ownerId,
                    name,
                },
            });
            if (existing) {
                return res
                    .status(409)
                    .json({ error: "Business with this name already exists" });
            }
            // 👉 Krijo biznesin
            const business = await prisma.business.create({
                data: {
                    ownerId,
                    name,
                    phoneNumber,
                    description,
                    address,
                    city,
                    country,
                    postalCode,
                    website,
                    category,
                    workingHours,
                },
            });
            res.status(201).json(business);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};
