const express =require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET="hamabm@#45";

// ROUTE 1 :Create a User using:  POST "/api/auth/createUser". Doesnt require auth. No login required.

router.post('/createUser',[
    body('email',"Enter a valid email").isEmail(),
    body('name',"Enter a valid name").isLength({ min: 3 }),
    body('password',"Enter a valid password").isLength({ min: 5 })
],async(req,res)=>{

    //Validation : If there are errors return bad request and errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success:false, errors: errors.array() });
    }

    //Check whether the user with this email is exists already

    try {
    let user = await User.findOne({email: req.body.email});
    if(user)
    {
        return res.status(400).json({ success:false,error:"Sorry user with this email is already exists"})
    }

    const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(req.body.password,salt);

    //Creating a User..
    user= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
      
    //JWT autherization .....

    const data={
        user : {
            id :user.id
        }
    }
    const authToken= jwt.sign(data,JWT_SECRET);
    res.json({ success:true,authToken})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error ocurred");
    }
})






//ROUTE 2 :Authenticating a User using:  POST "/api/auth/loginUser". No login required.

router.post('/login',[
    body('email',"Enter a valid email").isEmail(),
    body('password',"Password cant be blank").exists(),
],async(req,res)=>{

    //If there are errors return bad request and errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success:false,errors: errors.array() });
    }

    const {email,password}=req.body;
    try {
        let user=await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({success:false,error:"Please try to login with correct Credentials"});
        }

        //Comparing password hash with password entered by user...
        const comaparePass= await bcrypt.compare(password,user.password);
        if(!comaparePass){
            return res.status(400).json({success:false,error:"Please try to login with correct Credentials"}); 
        }

        const data={
            user : {
                id :user.id
            }
        }
        const authToken= jwt.sign(data,JWT_SECRET);
        res.json({success:true,authToken})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }




})


//ROUTE 3 :Get loggedin User Details using:  POST "/api/auth/getUser".login required.

router.post('/getUser',fetchuser,async(req,res)=>{

    try {
        userID=req.user.id;
        const user=await User.findById(userID).select("-password")
        res.send(user)
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})



module.exports=router