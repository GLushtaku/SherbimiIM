"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all users
router.get("/", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});
// Create a new user
router.post("/", async (req, res) => {
    const { name, email } = req.body;
    try {
        const newUser = await prisma.user.create({
            data: { name, email },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(400).json({ error: "Error creating user" });
    }
});
exports.default = router;
