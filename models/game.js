const mongoose = require('mongoose');
const config = require('../config/database');
const User = require('./user');
const moment = require('moment');

const GameSchema = mongoose.Schema({
    users:{
        type: Array
    },
    pot: {
        type: Number,
        required: true
    },
    tickets:{
        type: Number
    },
    status:{
        type: String
    },
    winner: {
        type: Object
    },
    gameEnd: {
        type: Date,
        unique: true
    }
});

//export mongoose model, call it 'Game' and use the GameSchema
const Game = module.exports = mongoose.model('Game', GameSchema);

//Saves new game to db
module.exports.createGame = function(newGame, callback){
    newGame.save(callback);
}

//Find any currently active games
module.exports.findActiveGame = function(callback){    
    //since there will only be 1 instance of an active game, just need to findOne() and get back the onject instead of find() which returns array of objects
    Game.findOne({'status': 'active'}, callback); 

}

module.exports.addUserUpdatePot = function(gameId, userId, userTickets, username, callback){
    //add user to game then User.makeBet then add their bet amount to the pot if User.makeBet successful
    bet = parseFloat(userTickets);

    Game.findOneAndUpdate(
        gameId, 
        {$inc:
            {pot: userTickets}, 
        $push:{
            "users": 
                {
                "username": username,
                "userId": userId,
                "tickets": userTickets
                }
            }
        }, 
        {new: true}, 
        callback);
}


module.exports.setComplete = function(gameId, callback){
    Game.findOneAndUpdate(gameId, {$push:{"status":"Complete"}}, {new: true}, callback);
}

// module.exports.calcUserWinChance = function(){
//     //every time new user places a bet, calculate winChance for all users based off their bet amount

// }

// module.exports.checkGameEndExists = function(gameId, callback){
//     Game.findOneAndUpdate(game) //TO DO
// }

// module.exports.startGame = function(gameId, endGameTime, callback){
//     console.log(endGameTime);
    
//     Game.findOneAndUpdate(gameId, {$set: {"gameEnd" : endGameTime}}, {unique: true}, callback);
// }

// module.exports.calcWinner = function(gameId, user){
//     //calculate winner algorithm, return winner

// }

// module.exports.finishGame = function(){
//     //pay winner of current game the pot amount and set game status to finished
// }

 