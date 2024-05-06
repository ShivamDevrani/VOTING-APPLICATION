const mongoose=require('mongoose');


const candidateSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    age:{
        type:String,
        required:true,
    },
    partyName:{
        type:String,
        required:true,
    }
    
})

const CANDIDATE=mongoose.model('CANDIDATE',candidateSchema);

module.exports=CANDIDATE;