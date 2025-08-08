import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const dbConnect = async()=>{
      try {

       const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log("mongoDB Connected successfully", `DbHost${connectionInstance.connection.host}`)
        
      } catch (error) {                                                                  
        console.log("mongodb connection error",error)
        process.exit(1) //process us process ka refernce jispe hmara program chlra h
      }
}
export default dbConnect