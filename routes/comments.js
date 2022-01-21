const mongoose=require('mongoose')
const commentSchema=mongoose.Schema({
comments:String,
postid:{type:mongoose.Schema.Types.ObjectId,ref:'posts'},
reply:[]
})
module.exports=mongoose.model('comments',commentSchema);