const express=require('express');

const path=require('path');

const app=express();

const db=require('./db');

const cors=require('cors');

app.use(cors());
const bodyParser=require('body-parser');

const cookieParser = require('cookie-parser');

app.use(cookieParser());



app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


//routes

const staticRoutes=require('./routes/staticRoutes');
const userRoutes=require('./routes/userRoutes');
const adminRoutes=require('./routes/adminRoutes');

app.use('/',staticRoutes);
app.use('/admin',adminRoutes);
app.use('/user',userRoutes);


//views

app.set('view engine','ejs');

app.set('views',path.resolve('./views'));

app.use(express.static('views'));

app.use('/image', express.static('views/images'));

app.use('/css',express.static('views/css'));

const PORT=process.env.PORT || 8000;

app.listen('8000',()=>{
    console.log('server is live');
})
