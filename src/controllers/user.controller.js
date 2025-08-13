import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken= async(userId)=>{

  try {
    const user = await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken= user.generateRefreshToken()
    
   user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})

   return {accessToken, refreshToken}

  } 
  catch (err) {
    throw new ApiError(500, "something went wrong while generating refresh and access tokens")
    
  }

}








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
    //  console.log("email: ", email)
    //  console.log("fullName: ", fullName)
    //  console.log("username: ", username)
    //  console.log("password: ", password)
     
 
      if(
        [ fullName,email,username,password].some((field)=> //validation 
                  field?.trim()===""  ) //agr trim karne k baad bhi true aya yani ki field khali tha 

      ){
        throw new ApiError(400, "all fields are required")
      }
       
      const existedUser= await User.findOne(
         {
            $or:[{username}, {email}]
         }
       )

       if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
       }
      

      console.log("req.files: ", req.files); // 👈 Add this temporarily

const avatarFiles = req.files?.avatar;
const coverImageFiles = req.files?.coverImage;

const avatarLocalPath = Array.isArray(avatarFiles) && avatarFiles[0]?.path;
const coverImageLocalPath = Array.isArray(coverImageFiles) && coverImageFiles[0]?.path;

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
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
          const createdUser= await User.findById(user._id).select(
            "-password -refreshToken" //hatana h ise kyuki by default sb selected hote hai
          )

          if(!createdUser){
            throw new ApiError(500 , "something went wrong while creating the user")
          }

      return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
      )

    })

    //LOGIN USER
 
const loginUser = asyncHandler(async(req,res) =>{
    
  const {email,username, password} = req.body
   
  if(!username && !email){
    throw new ApiError(400, "username or email is required")
  }
    
  const user = await User.findOne({  // extracts first entry from database registration
     $or:[{username} , {email}]     //dono k base pe dekega 
  }) 

  if(!user){
    throw new ApiError(400, "User not registered")
  }


  const isPasswordValid= await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401, "password is incorrect")
  }
 
  const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id) //jaha lage time lag skta h waha await lagado
  
  const loggedInUser= await User.findById(user._id).select("-password -refreshToken") //hata do

    const options = {
      httponly: true, //ab cookie sirf server se modify ho skti hai not from frontend
      secure:true
    }


    return res
    .status(200)
    .cookie("accessToken" , accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200, {
          user: loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
      )
    )

})

const logoutUser = asyncHandler(async(req, res)=>{
await User.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken:undefined //refresh token database se gayab
    }
  }, 
  {
    new:true //nayi updated value dega
  }
 )   

const options = {
      httponly: true, //ab cookie sirf server se modify ho skti hai not from frontend
      secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "UserloggedOut successfully"))

})


const refreshAccessToken= asyncHandler(async(req,res)=>{
 const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
  
        if(!incomingRefreshToken){
          throw new ApiError(401, "Unauthorized request")
        }
  
  try {
     const decodedToken= jwt.verify( //to decode the token
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
     const user= await User.findById(decodedToken?._id)
      if(!user){
            throw new ApiError(401, "invalid user token")
          }
           
          if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401, "Refresh token is generated")
          }
       
          const options= {
            httponly:true,
            secure:true
          }
         
        const {accessToken, newRefreshToken}=  await generateAccessAndRefreshToken(user._id)
  
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
           200, {
            accessToken, refreshToken: refreshAccessToken
           }, 
           "Access token generated"
          )
        )
  } catch (error) {
    throw new ApiError(401, error?.message || "Something went Wrong")
    
  }


})

     

export {registerUser, loginUser, logoutUser, refreshAccessToken}