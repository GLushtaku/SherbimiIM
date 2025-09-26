"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.authorController = {
    // POST create author /api/authors
    createAuthor: async (req, res) => {
        try {
            const { name, surname, email, books } = req.body;
            if (!name || !surname || !email) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const existing = await prisma.author.findUnique({
                where: { email },
            });
            if (existing) {
                return res
                    .status(409)
                    .json({ error: "Author with this email already exists" });
            }
            const author = await prisma.author.create({
                data: {
                    name,
                    surname,
                    email,
                    books: books ? { create: books } : undefined,
                },
                include: { books: true },
            });
            res.status(201).json(author);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    // GET all authors /api/authors
    getAllAuthors: async (req, res) => {
        try {
            const authors = await prisma.author.findMany({
                include: { books: true },
            });
            res.status(200).json(authors);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    //GET author by id /api/authors/:id
    getAuthorById: async (req, res) => {
        try {
            const { id } = req.params;
            const author = await prisma.author.findUnique({
                where: { id: id },
                include: { books: true },
            });
            if (!author) {
                return res.status(404).json({ error: "Author not found" });
            }
            res.status(200).json(author);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    //Udate author by id /api/authors/:id
    updateAuthor: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, surname, email, books } = req.body;
            const existing = await prisma.author.findUnique({
                where: { id: id },
            });
            if (!existing) {
                return res.status(404).json({ error: "Author not found" });
            }
            const updatedAuthor = await prisma.author.update({
                where: { id: id },
                data: {
                    name: name || existing.name,
                    surname: surname || existing.surname,
                    email: email || existing.email,
                    updatedAt: new Date(),
                    books: books ? {
                        deleteMany: {},
                        create: books
                    } : undefined,
                },
                include: { books: true },
            });
            res.status(200).json(updatedAuthor);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    //DELETE author by id /api/authors/:id
    deleteAuthor: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await prisma.author.findUnique({
                where: { id: id },
            });
            if (!existing) {
                return res.status(404).json({ error: "Author not found" });
            }
            await prisma.author.delete({
                where: { id: id },
            });
            res.status(204).send();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};
