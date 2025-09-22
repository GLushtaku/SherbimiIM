import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const businessController = {
  //GET /api/businesses => get all businesses
  getAllBusinesses: async (req: Request, res: Response) => {
    try {
      const businesses = await prisma.business.findMany();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //GET /api/businesses/:id => get business by id
  getBusinessById: async (req: Request, res: Response) => {
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
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createBusiness: async (req: Request, res: Response) => {
    try {
      const business = await prisma.business.create({
        data: req.body,
      });

      if (!business) {
        return res.status(400).json({ error: "Business not created" });
      }
      const existringBusiness = await prisma.business.findUnique({
        where: { id: business.id },
      });
      if (existringBusiness) {
        return res.status(409).json({ error: "Business already exists" });
      }
      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
