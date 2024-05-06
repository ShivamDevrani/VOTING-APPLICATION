const express=require('express');

const router=express.Router();

const USER=require('../model/userSchema');
const CANDIDATE=require('../model/candidateSchema');
const VOTE=require('../model/voteSchema');

const {jwtAuthMiddleware,generateToken}=require('../middleware/jwt');
const { localsName } = require('ejs');

const isAllowed =function (invitationKey)
{
    if(invitationKey==4154)
    return true;
    else return false;
}

//signup
router.post('/signup', async (req, res) => {
    try {
      const data = req.body;
      const role = data.invitationKey && isAllowed(data.invitationKey) ? 'admin' : 'user';
      //checking for unique adhaar
      const prevUser=await USER.findOne({adhaar:data.adhaar});
      if(prevUser) return res.render('signup',{
        error:'Aadhar already registered'
      });

      const user = new USER({
        name: data.name.toUpperCase(),  
        adhaar: data.adhaar,
        password: data.password,
        role: role,
      });
  
      await user.save();
      res.redirect('/login');
    } catch (err) {
      console.log(err);
      res.redirect('/signup');  
    }
  });


  //login
router.post('/login',async(req,res)=>{
  try{
    const {adhaar,password}=req.body;

    const user=await USER.findOne({adhaar:adhaar});

    if(!user)
    {
     return res.render('login',{
      error:'User Not Found'
     });
    }
      
  
    if(!await user.comparePassword(password)) {
      
      return res.render('login',{error:'Wrong Password'});
    }

    console.log('hello');
     const payload={
        role:user.role,
        id:user.id,
     } 
     const token=generateToken(payload);
    
     res.cookie('token', token);
    
     console.log('login successfull');

     if(user.role==='admin')
     return res.redirect('/admin');
    return  res.render('home',{
      logout:'yes',
    });
    
  }catch(err)
  {
    console.log(err);
    return res.redirect('/login?error=An error occurred');
  }
})


router.post('/vote',jwtAuthMiddleware,async(req,res)=>{
  const {name}=req.body;
   try{
     const candidate=await CANDIDATE.findOne({name:name});
     const user=await USER.findById(req.user.id);

     if(user.isVoted) return res.redirect('/user/vote/certificate?already voted');
      
     const vote=new VOTE({
      partyName:candidate.partyName,
      user:req.user.id,
     });
      user.isVoted=true;
      await vote.save();
      await user.save();
    
     res.redirect('/user/vote/certificate?voted successfully');
   }catch(err)
   {
    console.log(err);
    return res.redirect('/user/vote?error=An error occurred');

   }
})



module.exports=router;