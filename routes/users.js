const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

//register new user
router.post('/register', (req, res, next)=>{
    //create new instance of User, set balance to 2000
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        balance: 2000
    });

    User.addUser(newUser, (err, user) => {
        if(err){
            res.json({success: false, msg: "Failed to register user!"});
        } else {
            res.json({success: true, msg: "User registered successfully!"});
        }
    });
});

//Authorize user
router.post('/login', (req, res, next)=>{
    const username = req.body.username;
    const password = req.body.password;

    //get user with this username
    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success: false, msg:"User was not found!"});
        }

        //if the user was found, compare the entered password with the stored password
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            //if the password is a match then assign the user a json web token
            if(isMatch){
                const token = jwt.sign({data: user}, config.secret, {
                    expiresIn: "21600" //6hrs
                });
                //return the json web token and the user information
                res.json({
                    success: true, 
                    token: 'JWT '+token, 
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        balance: user.balance
                    }
                });
            } else {
                return res.json({success: false, msg:"Incorrect password!"});
            }
        });
    })
});

//get user information for profile route - PROTECTED 
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({user: req.user});
});


//export router
module.exports = router;