const express = require('express');
const router = express.Router();
var passport = require("passport");
var jwt = require("jsonwebtoken");
var User = require("../models/user");
var config = require("../config/database");


// register
router.post("/register",(req,res,next)=>{
    var newUser = new User({
        name:req.body.name,
        email:req.body.email,
        username:req.body.username,
        password: req.body.password
    });
    User.addUser(newUser,(err,user)=>{
        if(err){
            res.json({success:false,msg:"Failed to register user"});
        }else{
            res.json({success:true,msg:"User registered"});
        }
    });
});


// authenticate
router.post("/authenticate",(req,res,next)=>{
    var username = req.body.username;
    var password = req.body.password;
    User.getUserByUsername(username,(err,user)=>{
        if(err) throw error;
        if(!user){
            return res.json({success:false,msg:"User not found"});
        } 
        User.comparePassword(password,user.password,(err,isMatch)=>{
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn:640800 // 1 week
                });
                res.json({
                    success:true,
                    token:"JWT "+token,
                    user:{
                        id:user._id,
                        name:user.name,
                        username:user.username,
                        email:user.email
                    }
                });
            }
            else{
                return res.json({success:false,msg:"wrong password"});
            }
            
        });

    });
});

// profile
router.get("/profile",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
    res.json({user:req.user});
});


module.exports=router;

