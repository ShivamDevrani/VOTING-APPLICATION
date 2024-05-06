const mongoose=require('mongoose');

require('dotenv').config();

const LOCAL_URL=process.env.LOCAL_URL;
const URL=process.env.DB_URL;

mongoose.connect(URL);

const db=mongoose.connection;

db.on('connected',()=>{
    console.log('mongdb is connected');
})

db.on('disconnected',()=>{
    console.log('mongodb is disconnected');
})

db.on('error',(err)=>{
    console.log(err);
})

module.exports=db;