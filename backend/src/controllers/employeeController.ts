import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const employeeController = {
  // GET /api/employees - Get all employees
  getAllEmployees: async (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      // Build where clause for search
      const whereClause: any = { businessId };

      if (search && typeof search === "string" && search.trim() !== "") {
        whereClause.name = {
          contains: search.trim(),
          mode: "insensitive",
        };
      }

      const employees = await prisma.employee.findMany({
        where: whereClause,
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          employeeServices: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      res.json({ employees });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  },

  // GET /api/employee/:id - Get employee by ID
  getEmployeeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      // Business ownership is already verified by middleware
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          employeeServices: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  },

  // POST /api/employee - Create new employee
  createEmployee: async (req: Request, res: Response) => {
    try {
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      const {
        name,
        email,
        phoneNumber,
        position,
        isActive = true,
        serviceIds = [],
      } = req.body;

      const employee = await prisma.employee.create({
        data: {
          businessId,
          name,
          email,
          phoneNumber,
          position,
          isActive,
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          employeeServices: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee" });
    }
  },

  // PUT /api/employee/:id - Update employee
  updateEmployee: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const businessId = req.businessId;
      const { name, email, phoneNumber, position, isActive } = req.body;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      console.log("Update employee request:", {
        id,
        businessId,
        body: req.body,
      });

      // Business ownership is already verified by middleware
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (position !== undefined) updateData.position = position;
      if (isActive !== undefined) updateData.isActive = isActive;

      const employee = await prisma.employee.update({
        where: { id },
        data: updateData,
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          employeeServices: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  durationMinutes: true,
                },
              },
            },
          },
        },
      });

      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  },

  // DELETE /api/employee/:id - Delete employee
  deleteEmployee: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      // Business ownership is already verified by middleware
      await prisma.employee.delete({
        where: { id },
      });

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  },

  // POST /api/employee/:id/services - Assign service to employee
  assignServiceToEmployee: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { serviceId } = req.body;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      // Check if service belongs to the same business
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          businessId: businessId,
        },
      });

      if (!service) {
        return res
          .status(404)
          .json({
            error: "Service not found or doesn't belong to your business",
          });
      }

      // Create employee-service relationship
      const employeeService = await prisma.employeeService.create({
        data: {
          employeeId: id,
          serviceId: serviceId,
        },
      });

      res.json({
        message: "Service assigned to employee successfully",
        employeeService,
      });
    } catch (error) {
      console.error("Error assigning service to employee:", error);
      res.status(500).json({ error: "Failed to assign service to employee" });
    }
  },

  // DELETE /api/employee/:id/services/:serviceId - Remove service from employee
  removeServiceFromEmployee: async (req: Request, res: Response) => {
    try {
      const { id, serviceId } = req.params;
      const businessId = req.businessId;

      if (!businessId) {
        return res.status(400).json({ error: "Business context required" });
      }

      // Check if relationship exists and belongs to the business
      const employeeService = await prisma.employeeService.findFirst({
        where: {
          employeeId: id,
          serviceId: serviceId,
          employee: {
            businessId: businessId,
          },
        },
      });

      if (!employeeService) {
        return res
          .status(404)
          .json({
            error: "Employee-service relationship not found or access denied",
          });
      }

      // Delete the relationship
      await prisma.employeeService.delete({
        where: { id: employeeService.id },
      });

      res.json({ message: "Service removed from employee successfully" });
    } catch (error) {
      console.error("Error removing service from employee:", error);
      res.status(500).json({ error: "Failed to remove service from employee" });
    }
  },
};
