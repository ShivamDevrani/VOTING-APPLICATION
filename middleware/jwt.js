const jwt=require('jsonwebtoken');

require('dotenv').config();

const jwtAuthMiddleware=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token) return res.redirect('/login');
    try{
        const decoded=await jwt.verify(token,process.env.JWT_KEY);
        req.user=decoded;
        next();

    }catch(err)
    {
        console.log(err);
        res.redirect('/login?error=invalid token');
    }
}


const jwtParser=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token) return res.render('home');
    try{
        const decoded=await jwt.verify(token,process.env.JWT_KEY);
        req.user=decoded;
        next();

    }catch(err)
    {
        console.log(err);
        res.status(401).json({error:"invalid token"});
    }
}

const generateToken=(userdata)=>{
    return jwt.sign(userdata,process.env.JWT_KEY);
}

module.exports={jwtAuthMiddleware,jwtParser,generateToken};