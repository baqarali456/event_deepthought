import express from 'express';
import dotenv from "dotenv";
import connectDB from './src/db/db.js';
import cors from "cors";
dotenv.config();
import { uploadFileonCloudinary } from './src/utils/cloudinary.js';
import { upload } from './src/middleware/multer.middleware.js';

import { ObjectId } from 'mongodb';




const app = express();

app.use(express.json())
app.use(cors(
    {
        origin:process.env.ORIGIN,
        credentials:true,
    }
))

app.use(express.static("public"));


app.post("/api/v3/app/events",upload.single('image'),async(req,res)=>{
    try {
        const {name,tagline,schedule,description,moderator,category,sub_category,rigor_rank} = req.body;

        if([name,tagline,description,moderator,category,sub_category].some(field=>field?.trim() === "")){
            return res.status(400).json({message:"all fields are required"});
        }

        const scheduleData = new Date(schedule).getTime()
        const numberSchedule = Number(scheduleData)
        const numberrigorRank = Number(rigor_rank)

        if(isNaN(numberSchedule) || isNaN(numberrigorRank)){
          return res.status(400).json({message:"schedule or rigorank is not a number"})
        }
        
        const filepath = req.file?.path;
        
        if(!filepath){
            return res.status(400).json({message:"file path is required"});

        }

        const image = await uploadFileonCloudinary(filepath);

    

        if(!image){
            return res.status(400).json({message:"image is required"});
        }

        const db = await connectDB()

        const event = await db.collection('events').insertOne({
            name,tagline,schedule:numberSchedule,description,moderator,category,sub_category,rigor_rank,type:"event",
           attandees:[],image,
        })

        return res.status(201).json(
            {
                message:"event successfully created",
                _id:event.insertedId
            }
        )
    } catch (error) {
        return res.status(500).json(
            {
                message:error.message || "something went wrong while event creating",
            }
        )
    }
})

app.put("/api/v3/app/events/:id",upload.single('image'),async(req,res)=>{
        try {
        const {name,tagline,schedule,description,moderator,category,sub_category,rigor_rank} = req.body;

        const {id} = req.params;

        if([name,tagline,schedule,description,moderator,category,sub_category,rigor_rank].some(field=>field?.trim() === "")){
            return res.status(400).json({message:"all fields are required"});
        }
        
        const filepath = req.file?.path;
        

        const image = await uploadFileonCloudinary(filepath);



        const db = await connectDB()

       const findevent =  await db.collection('events').findOne({_id:new ObjectId(id)})

       if(!findevent){
        return res.status(400).json({message:"event not found associated with this id and id is not valid"})
       }

        

        const event = await db.collection('events').updateOne({_id:new ObjectId(id),},{$set:{
            name,tagline,schedule,description,moderator,category,sub_category,rigor_rank,type:"event",
           attandees:[],image:image?image:findevent.image,
        }})

        return res.status(200).json(
            {
                message:"event successfully updated",
                _id:event
            }
        )
    } catch (error) {
        return res.status(500).json(
            {
                message:error.message || "something went wrong while event updating",
                
            }
        )
    }
})
app.delete("/api/v3/app/events/:id",async(req,res)=>{
        try {
        

        const {id} = req.params;

        const db = await connectDB()


        const event = await db.collection('events').deleteOne({_id:new ObjectId(id)})

        if(event.deletedCount === 0){
            return res.status(404).json({message:"event doesn't exist"})
        }

        return res.status(200).json(
            {
                message:"event successfully deleted",
            }
        )
    } catch (error) {
        return res.status(500).json(
            {
                message:error.message || "something went wrong while event deleting",
            }
        )
    }
})

app.get("/api/v3/app/events",async(req,res)=>{
   try {
       const db = await connectDB();
      if(req.query.id){

        const {id} = req.query
    
         const event = await db.collection('events').findOne({_id:new ObjectId(id)})
    
         if(!event){
            return res.status(404).json({'message':"event no not found"})
         }
    
         return res.status(200).json(
                {
                    message:"event get successfully ",
                    event
                }
            )
      }

      if(req.query.page && req.query.limit || req.query.type){
        const {type="latest",page=1,limit=5} = req.query;
      const Intpage = parseInt(page)
      const IntLimit = parseInt(limit)

     const events = await db.collection('events').find({type}).skip((Intpage-1) * IntLimit).limit(IntLimit).toArray()


     return res.status(200).json(
            {
                message:"events get successfully ",
                events
            }
        )
      }


   } catch (error) {
       return res.status(500).json(
            {
                message:error.message || "something went wrong while event deleting",
            }
        )
   }
})


const PORT = process.env.PORT || 8000;

app.listen(PORT,()=>{
    console.log("Server Listening on PORT ",PORT)
})