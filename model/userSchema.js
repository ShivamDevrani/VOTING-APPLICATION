const mongoose=require('mongoose');

const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
    adhaar:{
        type:Number,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    },
    isVoted:{
        type:Boolean,
        default:false,
    }
})

userSchema.pre('save',async function(next){
    const user=this;
    if(!user.isModified('password'))
    return next();

    try{
        const salt=await bcrypt.genSalt(5);

        const hashedPassword=await bcrypt.hash(user.password,salt);

        user.password=hashedPassword;

        next();

    }
    catch(err)
    {
        return next(err);
    }
})


userSchema.methods.comparePassword = async function (userPassword) {
    try {
      const isMatch = await bcrypt.compare(userPassword, this.password);
      return isMatch;
    } catch (err) {
      throw err; 
    }
  };
const USER=mongoose.model('USER',userSchema);

module.exports=USER;