import mongoose from "mongoose";


const messageSchema=new mongoose.Schema({
senderId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
receiverId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
text:{type:String,},
image:{type:String,},
seen:{type:Boolean,default:false},
deleted:{type:Boolean,default:false},
editedAt:{type:Date,default:null},
replyTo:{type:mongoose.Schema.Types.ObjectId,ref:"Message",default:null},
reactions:[{
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    emoji:{type:String,required:true}
}],
},{timestamps:true});


const Message=mongoose.model("Message",messageSchema);


export default Message;