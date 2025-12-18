import mongoose from "mongoose"

const Admindb = new mongoose.Schema({
    id_no:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        requird:true,
    },
    profile:{
        type:String,
        default:"https://img.freepik.com/free-icon/user_318-804790.jpg",
    },
    walletAddress:{
        type:String,
        required:true,
        unique:true
    },
    walletSecret:{
        type:String,
        required:true,
        unique:true
    },
    currentPhase:{
        type:String,
        emun:["Registration","Voting","Result" ,"Selection Pending"],
        default:"Selection Pending"
    }

})

const AdminData = mongoose.model("Admin Details" , Admindb)
export default AdminData;