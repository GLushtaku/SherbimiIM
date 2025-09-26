import { Request , Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const bookingController ={

     //GET /api/bookings = get all bookings 
     getAllBookings: async (req: Request, res: Response) => {
        try {
          const { date, limit } = req.query;
    
          const whereClause: any = {};
          if (date) {
            const startDate = new Date(date as string);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            whereClause.appointmentTime = {
              gte: startDate,
              lt: endDate,
            };
          }
    
          const bookings = await prisma.booking.findMany({
            where: whereClause,
            take: limit ? parseInt(limit as string) : undefined,
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
    
          res.json(bookings);
        } catch (error) {
          console.error("Error fetching bookings:", error);
          res.status(500).json({ error: "Failed to fetch bookings" });
        }
      },

      //GET /api/bookings/{id} = get booking by id
      getBookingById: async (req:Request,res:Response)=>{
        try{
            const {id} = req.params;
            const booking = await prisma.booking.findUnique({
                where:{id},
                include:{
                    client:{
                        select:{
                            id:true,
                            name:true,
                            email:true,
                            phoneNumber:true
                        }
                    },
                    service:{
                        select:{
                            id:true,
                            name:true,
                            price:true,
                            durationMinutes:true
                        }
                    },
                    employee:{
                        select:{
                            id:true,
                            position:true,
                            name:true
                        }
                    }
                }
            });
            if(!booking){
                return res.status(404).json({error:"Booking not found"});
            }
            res.json(booking);
        }catch(error){
            console.error("Error fetching booking:",error);
            res.status(500).json({error:"Failed to fetch booking"});
        }
      },

      //POST /api/bookings = create new booking
      createBooking: async (req: Request, res: Response) => {
        try {
          const {
            clientId,
            serviceId,
            employeeId,
            start,
            end,
            status = "PENDING",
          } = req.body;
    
          const booking = await prisma.booking.create({
            data: {
              clientId,
              serviceId,
              employeeId,
              start: new Date(start),
              end: new Date(end),
              status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
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
        } catch (error) {
          console.error("Error creating booking:", error);
          res.status(500).json({ error: "Failed to create booking" });
        }
      },

      updateBooking: async(req:Request,res:Response)=>{
        try{
            const {id } = req.params;
            const {start , end , status} = req.body;

            const updateData: any={};
            if (start !== undefined) updateData.start = new Date(start);
            if (end !== undefined) updateData.end = new Date(end);
            if (status !== undefined) updateData.status = status;

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

        }catch(error){
            console.error("Error updating booking:", error);
            res.status(500).json({ error: "Failed to update booking" });
        }
      },

       // DELETE /api/bookings/:id - Delete booking
  deleteBooking: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.booking.delete({
        where: { id },
      });

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  },

  // POST /api/bookings/availability - Check availability
  checkAvailability: async (req: Request, res: Response) => {
    try {
      const { employeeId, serviceId, date } = req.body;

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
        },
      });

      // Generate available time slots (simplified - every hour from 9 AM to 5 PM)
      const availableSlots = [];
      const startHour = 9;
      const endHour = 17;

      for (let hour = startHour; hour < endHour; hour++) {
        const slotTime = new Date(startDate);
        slotTime.setHours(hour, 0, 0, 0);

        // Check if this slot conflicts with existing bookings
        const hasConflict = existingBookings.some((booking) => {
          const bookingTime = new Date(booking.start);
          return (
            Math.abs(bookingTime.getTime() - slotTime.getTime()) <
            service.durationMinutes * 60 * 1000
          );
        });

        if (!hasConflict) {
          availableSlots.push(slotTime.toISOString());
        }
      }

      res.json({ availableSlots });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  },
}