import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors( {
    origin:process.env.CORS_ORIGIN,
    credentials: true
} )) //this takes a object 

app.use(express.json({limit:"16kb"})) //aapne form bhara toh humne data lia

//ab url se data ja rha h toh kese handle karna h

app.use(express.urlencoded({extended:true , limit:"16kb"}))  //express configurations
app.use(express.static('public'))
app.use(cookieParser())


export default app