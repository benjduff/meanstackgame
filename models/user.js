const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

//user schema
const UserSchema = mongoose.Schema({
    name: {
        type: String
    },
    email:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    balance:{
        type: Number
    }
});

//export user model, call it 'User' and use UserSchema
const User = module.exports = mongoose.model('User', UserSchema);

//find user by id
module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

//find user by username entered in the req.body from users route
module.exports.getUserByUsername = function(username, callback){
    const query = {
        username: username
    }
    User.findOne(query, callback);
}

//add new user
module.exports.addUser = function(newUser, callback){
    //using bcrypt module generate 10 rounds of salt (default amount)
    bcrypt.genSalt(10, (err, salt) => {
        //hash new users password with salt and save to db
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        })
    })
}

//compare candidates password with saved hashed password and return true/false to isMatch bool
module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

//check user bal for betAmount, either make bet or return funds not available
module.exports.makeBet = function(id, betAmount, callback){

}