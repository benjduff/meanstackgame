const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('../config/database');

module.exports = function(passport){
    //options
    let opts = {}; 
    //extract json web token from Authorization header
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log(jwt_payload);
        
        //get user by user id in jwt payload
        User.getUserById(jwt_payload.data._id, (err, user) => {{
            if(err){
                return done(err, false);
            }
            if(user){
                done(null, user);
            } else {
                done(null, false);
            }
        }});
    }))
}