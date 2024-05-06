const express=require('express');

const router=express.Router();

const CANDIDATE=require('../model/candidateSchema');

const {jwtAuthMiddleware}=require('../middleware/jwt');

const isAdmin=function(role){
    return role==='admin';
}

router.post('/candidate',jwtAuthMiddleware,async(req,res)=>{

    if(!isAdmin(req.user.role)) return res.render('/?you are not authorised');
    
    const data=req.body;
    try{
        const candidate= new CANDIDATE({
            name:data.name.toUpperCase(),
            age:data.age,
            partyName:data.partyName.toUpperCase()
        });
        await candidate.save();
        console.log('candidate added successfully');
        res.redirect('/admin/candidate?added=SUCCESS');
    }catch(err)
    {
         console.log(err);
         res.redirect('/admin/candidate?added=failure');
    }
})

router.post('/candidate/delete',jwtAuthMiddleware,async(req,res)=>{
     //admin role only
     if(!isAdmin(req.user.role)) return res.render('/?you are not authorised');

    const data=req.body;
    try{
        const name=data.name.toUpperCase();
        const age=data.age;
        const partyName=data.partyName.toUpperCase();
        const candidate=await CANDIDATE.findOneAndDelete({
            name:name,
            age:age,
            partyName:partyName,
        });

        if(!candidate) return res.render('removeCandidate',{error:'Candidate Not Found'});
        console.log('removed successfully');
        return res.redirect('/admin?removed=success'); 
    }
    catch(err)
    {
        console.log(err);
        res.redirect('?error=internal server');

    }
})
module.exports=router;