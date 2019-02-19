const mongoose = require('mongoose');
const config = require('../config/database');
const User = require('./user');

const GameSchema = mongoose.Schema({
    users:{
        type: Array
    },
    pot: {
        type: Number,
        required: true
    },
    status:{
        type: String
    },
    winner: {
        type: Object
    },
    gameEnd: {
        type: Date
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
    startGame();
    Game.findOne({'status': 'active'}, callback); 
}

module.exports.addUserUpdatePot = function(username, bet, gameId, pot, callback){
    //add user to game then User.makeBet then add their bet amount to the pot if User.makeBet successful
    bet = parseFloat(bet);
    pot = parseFloat(pot);

    Game.findByIdAndUpdate(gameId,
        {
            "pot": pot+=bet,
            $push: 
            { "users": 
                {
                    "username": username, 
                    "betAmount": bet
                }
            }
        },
        {new: true}, 
        callback);
}

module.exports.calcUserWinChance = function(){
    //every time new user places a bet, calculate winChance for all users based off their bet amount

}

module.exports.startGame = function(gameId){
    //set the end of the game to 45 seconds from now
    const endGameTime = new Date();
    endGameTime.setSeconds(endGameTime.getSeconds() + 45);
    
    Game.findByIdAndUpdate(gameId, {"gameEnd": endGameTime}, {new: true}, callback);
}

module.exports.calcWinner = function(){
    //calculate winner algorithm, return winner
}

module.exports.finishGame = function(){
    //pay winner of current game the pot amount and set game status to finished
}

