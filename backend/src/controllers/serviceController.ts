import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const serviceController = {
  // GET /api/services
  getAllServices: async (req: Request, res: Response) => {
    try {
      const { category, search } = req.query;

      const whereClause: any = {};

      // Filter by category
      if (category) {
        whereClause.category = {
          name: {
            contains: category as string,
            mode: "insensitive",
          },
        };
      }

      // Filter by search term
      if (search) {
        whereClause.OR = [
          {
            name: {
              contains: search as string,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search as string,
              mode: "insensitive",
            },
          },
          {
            business: {
              name: {
                contains: search as string,
                mode: "insensitive",
              },
            },
          },
        ];
      }

      const services = await prisma.service.findMany({
        where: whereClause,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              phoneNumber: true,
              website: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              icon: true,
            },
          },
          employeeServices: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
      
      if (services.length === 0) {
        return res.status(200).json({ services: [] }); // ose 404 nëse preferon
      }
      
      return res.json({ services });
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  },

  // GET /api/services//{id}
  getServiceById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          business: true,
          category: true,
          employeeServices: {
            include: {
              employee: true,
            },
          },
        },
      });

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  },

  // POST /api/services
  createService: async (req: Request, res: Response) => {
    try {
      console.log("Creating service with data:", req.body);
      console.log("BusinessId from middleware:", req.businessId);

      // Merr businessId nga middleware (getBusinessId)
      const businessId = req.businessId;

      if (!businessId) {
        console.log("No businessId found in request");
        return res.status(400).json({
          error: "Business ID is required",
        });
      }

      const serviceData = {
        ...req.body,
        businessId,
      };

      const service = await prisma.service.create({
        data: serviceData,
      });

      console.log("Service created successfully:", service);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  },

  // PUT /api/services/{id}
  updateService: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({
          error: "Business ID is required",
        });
      }

      // Verifiko që service-i i përket këtij biznesi
      const existingService = await prisma.service.findFirst({
        where: {
          id,
          businessId,
        },
      });

      if (!existingService) {
        return res.status(404).json({
          error: "Service not found or you don't have permission to update it",
        });
      }

      const service = await prisma.service.update({
        where: { id },
        data: req.body,
      });
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  },

  // DELETE /api/services/{ id}
  deleteService: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({
          error: "Business ID is required",
        });
      }

      // Verifiko qe service-i i përket këtij biznesi
      const existingService = await prisma.service.findFirst({
        where: {
          id,
          businessId,
        },
      });

      if (!existingService) {
        return res.status(404).json({
          error: "Service not found or you don't have permission to delete it",
        });
      }

      await prisma.service.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  },
};
