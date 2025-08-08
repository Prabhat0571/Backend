import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
const registerUser = asyncHandler(async (req,res)=>{
     //how to register user? 
     //steps: 
     //1.get user details from frontend
     //2.validation: not empty
     //3.check user if already exist
     //4.check for avatar(required)
     //5.upload image to cloudinary
     //6.create user object- entry in db 
     //response se password and refresh token hata do
     //7.check for user creation
     //return response 

     const {fullName, email, username, password}= req.body //form ya url ka data yaha se milega
     console.log("email: ", email)
     console.log("fullName: ", fullName)
     console.log("username: ", username)
     console.log("password: ", password)
     
 
      if(
        [ fullName,email,username,password].some((field)=> //validation 
                  field?.trim()===""  ) //agr trim karne k baad bhi true aya yani ki field khali tha 

      ){
        throw new ApiError(400, "all fields are required")
      }
       
      const existedUser=  User.findOne(
         {
            $or:[{username}, {email}]
         }
       )

       if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
       }
      

       const avatarLocalPath= req.files?.avatar[0]?.path //"?" this means optional mile ya na mile
                                                    //first property li h kyuki usme path milega
       const coverImageLocalPath= req.files?.coverImage[0]?.path                                             

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar files is required")
        }

      //uploaded on cloudinary
        const avatar =  await uploadOnCloudinary(avatarLocalPath)
        const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
  
         if(!avatar){
              throw new ApiError(400, "Avatar files is required")
         } 


          const user= await User.create({ //user creation in database
            fullName,
            avatar: avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()

          })

          const createdUser= await user.findById(user._id).select(
            "-password -refreshToken" //hatana h ise kyuki by default sb selected hote hai
          )

          if(!createdUser){
            throw new ApiError(500 , "something went wrong while creating the user")
          }


      return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
      )



    })

export default registerUser