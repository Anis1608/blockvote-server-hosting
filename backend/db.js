import mongoose from "mongoose";
import "dotenv/config"
// const Mongo_database = "mongodb://localhost:27017/blockchain"
export const connectDatabase = () =>{
    mongoose.connect(process.env.MONGO_URI , {
        // useNewUrlParser: true, 
        // useUnifiedTopology: true,
        family: 4,})
}
console.log("Database Connected Sucessfully...")