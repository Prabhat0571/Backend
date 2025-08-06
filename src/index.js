import dotenv from 'dotenv';
import app from './app.js';
import dbConnect from "./db/index.js";
dotenv.config({
    path: "./.env"
})

dbConnect() //this returns a promise and we can use .then() and .catch() to handle the connection
.then(()=>{
   app.listen(process.env.PORT || 8000 , ()=>{
    `server is running at : ${process.env.PORT}`
   })
   app.on("error" , (err)=>{
           console.log("error logged" , err)
   })
})
.catch((err)=>{
    console.log(err)
})







