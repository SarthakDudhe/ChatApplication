import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
email:{type:String,required:true,unique:true},
fullname:{type:String,required:true},
password:{type:String,required:true,minlength:6},
profilePic:{type:String,default:""},
bio:{type:String,required:true},
lastSeen:{type:Date,default:Date.now},
},{timestamps:true});


const User=mongoose.model("User",userSchema);


export default User;