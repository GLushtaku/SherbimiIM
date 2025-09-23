"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.categoryController = {
    //Create category
    createCategroy: async (req, res) => {
        try {
            const { name, description, icon } = req.body;
            const newCategory = await prisma.category.create({
                data: {
                    name,
                    description,
                    icon,
                    isActive: true,
                },
            });
            res.status(201).json("Category created successfully");
        }
        catch (error) {
            console.error("Error creating category:", error);
            res.status(500).json({ error: "Failed to create category" });
        }
    },
    // GET /api/categories - Get all categories
    getAllCategories: async (req, res) => {
        try {
            const categories = await prisma.category.findMany({
                where: { isActive: true },
                include: {
                    services: {
                        select: {
                            id: true,
                            businessId: true,
                        },
                    },
                },
            });
            // Transform the data to match frontend expectations
            const transformedCategories = categories.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description || "",
                icon: category.icon || "📁",
                services: category.services.length,
                businessCount: new Set(category.services.map((s) => s.businessId)).size,
            }));
            res.json({ categories: transformedCategories });
        }
        catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ error: "Failed to fetch categories" });
        }
    },
    // GET /api/categories/:name - Get category by name
    getCategoryByName: async (req, res) => {
        try {
            const { name } = req.params;
            const category = await prisma.category.findUnique({
                where: { name },
                include: {
                    services: {
                        include: {
                            business: true,
                        },
                    },
                },
            });
            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }
            res.json(category);
        }
        catch (error) {
            console.error("Error fetching category:", error);
            res.status(500).json({ error: "Failed to fetch category" });
        }
    },
};
