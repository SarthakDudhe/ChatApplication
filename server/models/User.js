import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
email:{type:String,require:true,unique:true},
fullname:{type:String,require:true},
password:{type:String,require:true,minlength:6},
profilePic:{type:String,default:""},
bio:{type:String,require:true},
},{timestamps:true});


const User=mongoose.model("User",userSchema);


export default User;