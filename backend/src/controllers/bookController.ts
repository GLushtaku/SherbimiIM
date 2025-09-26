import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const bookController = {

//GET all books /api/books
getAllBooks: async (req:Request,res:Response)=>{
    try{
        const books = await prisma.book.findMany({
            include:{author:true}
        });
        res.status(200).json(books);

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
},

createBook: async (req:Request,res:Response)=>{
    try{
        const {name , authorId} = req.body;
        if(!name || !authorId){
            return res.status(400).json({error:"Missing required fields"});
        }

        const existingAuthor = await prisma.author.findUnique({
            where:{id:authorId}
        });
        if(!existingAuthor){
            return res.status(404).json({error:"Author not found"});
        }
        const book = await prisma.book.create({
            data:{name,authorId},
            include:{author:true}
        });
        res.status(201).json(book);

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
}


}