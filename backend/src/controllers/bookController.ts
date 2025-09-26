import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const bookController = {
  //GET all books /api/books
  getAllBooks: async (req: Request, res: Response) => {
    try {
      const books = await prisma.book.findMany({
        include: { author: true },
      });
      res.status(200).json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createBook: async (req: Request, res: Response) => {
    try {
      const { name, authorId } = req.body;
      if (!name || !authorId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingAuthor = await prisma.author.findUnique({
        where: { id: authorId },
      });
      if (!existingAuthor) {
        return res.status(404).json({ error: "Author not found" });
      }
      const book = await prisma.book.create({
        data: { name, authorId },
        include: { author: true },
      });
      res.status(201).json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getBookkById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const book = await prisma.book.findUnique({
        where: { id },
        include: { author: true },
      });
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateBook: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const updateData = req.body;

      const existing = await prisma.book.findUnique({
        where: { id },
      });
      if (!existing) {
        return res.status(404).json({ error: "Book not found" });
      }
      // Remove undefined values and add updatedAt
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      cleanUpdateData.updatedAt = new Date();

      const book = await prisma.book.update({
        where: { id },
        data: cleanUpdateData,
        include: { author: true },
      });
      res.status(200).json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteBook: async (res: Response, req: Request) => {
    try {
      const { id } = req.params;
      await prisma.book.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
