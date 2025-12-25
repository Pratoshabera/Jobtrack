const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router =express.Router();

//Register
router.post("/register", async (req, res)=>{
    try{
        const{name, email, password}= req.body;

        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({message: "User already exists"});
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user =await User.create({
            name,
            email,
            password: hashedpassword,
        });

        res.status(201).json({message: "User registered"});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
});


//LOGIN
router.post("/login", async(req, res)=>{
    try{
        const {email, password}= req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isMatch =await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const token =jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({token});
    }catch (error){
        res.status(500).json({message: error.message});
    }
});

module.exports=router;