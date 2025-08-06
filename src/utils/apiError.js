class ApiError extends Error{
    //node js provides us extensive error class for handling things 
    constructor(
        statusCode, 
           message= "something went wrong",
           errors = [],
           statck=" " 
    ){
        super(message)
        this.statusCode= statusCode
        this.data = null
        this.errors= errors
        this.success= false

        if(statck){
            this.stack= statck
        }
        else{
            Error.captureStackTrace(this , this.constructor)
        }
        
    }




}
export {ApiError}