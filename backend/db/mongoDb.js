import mongoose, {connect} from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB= async()=>{
    try{
        
     const connectionInstance= await mongoose.connect(`${process.env.MONGO_URI}Splitwise`)
     console.log(`MongoDb Connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

export default connectDB;