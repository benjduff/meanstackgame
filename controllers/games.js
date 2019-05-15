const express = require('express');
const config = require('../config/database');
const Game = require('../models/game');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const GamesController = require('../controllers/games');
const moment = require('moment');

//find a active game (should only be 1 anyway) and return game as 'foundGame'
exports.findActiveGame = function(req, res, next){
    Game.findActiveGame((err, foundGame) => { 
        if(err) throw err;
        if(!foundGame) {
            next();
        } else if(moment().isAfter(foundGame.gameEnd)){
            res.json({success: false, msg:"Game '" + foundGame._id + "' has already ended."});
        } else {
            res.json({
                success: true, 
                msg: "A currently active game has been returned.",
                game: foundGame
            });
        }
    });
}

//create new game with active status
exports.createActiveGame = function(req, res){
    const query = new Game({
        pot: req.body.pot,
        status: "active"
    });

    Game.createGame(query, (err, game) => {
        if(err) throw err;
        (!game) ? res.json({success: false, msg:"Oops, there was an error creating the game!"}) : res.json({success: true, msg:"Game created successfully!", game: game});
    });
}


//add a user to the current game
exports.gameAddUser = (req,res,next) => {
    const user = {
        id: req.body.userId,
        bet: req.body.bet,
        username: req.body.username
    }
    const gameId = req.body.gameId;

    //get user by id and check if user has enough funds to place the bet. If true, update the users balance.
    User.getUserById(user.id, (err, returnedUser) => {
        if(err) throw err;
        if(returnedUser.balance < user.bet) {
            res.json({success: false, msg:"Funds not available."});
        } else {
            const updatedBalance = returnedUser.balance -= user.bet;
            User.updateBalance(returnedUser.id, updatedBalance, (err) => {
                if (err) throw err;
                let userTickets = user.bet * 0.01;
                Game.addUserUpdatePot(gameId, user.id, userTickets, user.username, (err, updatedGame) => {
                    if(err) throw err;
                    if(updatedGame){
                        const currentGame = new Game({
                            id: updatedGame._id,
                            users: updatedGame.users,
                            pot: updatedGame.pot,
                            status: updatedGame.status,
                            end: updatedGame.gameEnd
                        });
                        console.log("Game Id: " + currentGame.id);

                        if(currentGame.users.length > 2 && currentGame.end == null){
                            const endGameTime = moment().add(45, 's').toDate();
                            Game.startGame(currentGame.id, endGameTime, (err, game) => {                                
                                if(err)throw err;
                                if(!game) res.json({success: false, msg:"Game not found."}); 
                                return res.json({success: true, msg:"User added to game.. Game started at: " + endGameTime});
                                });
                        } else {
                            res.json({success: true, msg:"user added to game.. Pot updated successfully."}); 
                        }
                    }
                });
            });
        }
    });
}






exports.setComplete = function(req, res, next){
    const gameId = req.body.gameId;

    Game.setComplete(gameId, (err, updated)  => {
        if(err) throw err;
        if(updated) res.json({success: true, msg:"Game: " + gameId + " has ended"});
        next();
    });
}

exports.calculateWinner = function(req, res, next){
    users.forEach(user => {
        if(count < winPerc || user.tickets > winPerc){
            break;
        } else {
            Game.submitWinner(user, (err, res) => {
                if(err) throw err;
                //calculate users chance of winning here(winChance)
                res.json({success: false, msg:"The winner of this round is " + user.username + "! With a wining chance of " + winChance + "%"});
            })
        }
    });
}


