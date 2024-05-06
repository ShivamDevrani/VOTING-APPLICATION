const mongoose=require('mongoose');

const voteSchema=new mongoose.Schema({
    partyName:{
        type:String,
        ref:'CANDIDATE',
        required:true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'USER',
       required:true
    },
    VotedAt:{
        type:Date,
        default:Date.now
     }
})



const VOTE=mongoose.model('VOTE',voteSchema);

module.exports=VOTE;