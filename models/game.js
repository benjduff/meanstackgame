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
    timer: {
        type: Number
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

module.exports.addUserWhenBet = function(gameId, user, callback){
    //add user to game then User.makeBet then add their bet amount to the pot if User.makeBet successful
}

module.exports.calcUserWinChance = function(){
    //every time new user places a bet, calculate winChance for all users based off their bet amount
}

module.exports.startGame = function(){
    //start countdown timer, calculate winner
}

module.exports.calcWinner = function(){
    //calculate winner algorithm, return winner
}

module.exports.finishGame = function(){
    //pay winner of current game the pot amount and set game status to finished
}

