import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const userSchema = mongoose.Schema(
    {
      username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true //thoda searching optimise krdeta h but expensive operation
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required'] //true field k sath ek custom error message de skte h
            //hum hooks bhi use kar skte hai jese ki pre jo ek basically middleware hai
        },
        refreshToken: {
            type: String
        }

    }
,{timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next(); //agr password m kch change hi nahi hua h toh kch change mt karo bs next krado

    this.password= await bcrypt.hash(this.password,10) // change hua h toh kardo
    //ye jo 10 itni baar round lgega for hashing
    next() //flag aage badha do
}) //jo bhi code execute karana h yaha likhdo only before a specific condition "save", "validation" etc

//password kese compare kiya jaye kyuki jo database m store h wo toh encrypted hai and user jo de rha hai wo hai 12345 mtlb basic ek string hai
//ye kaam bhi bcrypt kardeta hai /

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) //ye compare karke true ya false return
    //await isliye use kiya kyuki ye expensive operation hai and time lega toh isliye async await use kiya
}

userSchema.methods.generateAccessToken= function (){
   return jwt.sign ({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullName //this.fullName come fromd database
    },
          
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY //object k andr likhte hai

    }
)
}

userSchema.methods.generateRefreshToken= function (){
   return jwt.sign ({
        _id: this._id,
    },
          
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY //object k andr likhte hai

    }




)
}

export const User= mongoose.model("User", userSchema)