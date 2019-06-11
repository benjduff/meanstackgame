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
    const winPerc = Math.random();
    const query = new Game({
        pot: req.body.pot,
        status: "active",
        winPerc: winPerc
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
                Game.addUserUpdatePot(gameId, user.id, user.bet, userTickets, user.username, (err, updatedGame) => {
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
                                return res.json({success: true, msg:"User added to game.. Game will end at: " + endGameTime});
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
    const gameId = req.params.gameId;
    
    Game.setComplete(gameId, (err, updated)  => {
        if(err) throw err;
        if(!updated) res.json({success: false, msg:"There was an error ending the game."});
        res.locals.completedGame = updated;
        return next();
    });
}

exports.calcWinner = function(req, res, next){    
    const winNo = res.locals.completedGame.winPerc * (res.locals.completedGame.pot * 0.01);
    const players = res.locals.completedGame.users;
    var minWinNo = 0.0;

    players.forEach(player => { //check each user in users arr to find if winNo is within user tix range        
        var maxWinNo = minWinNo + player.tickets; //change userTickets see below comment.
        console.log(maxWinNo);


        if(winNo >= minWinNo && winNo <= maxWinNo){ //FIX - change to correct algorithm to find if winning number (winNo) is between the count and the users tickets, if not then break
            res.locals.winnerId = player.userId;
            res.locals.winnerUsername = player.username;
            res.locals.winChance = (player.tickets * 100) / res.locals.completedGame.pot * 100;

            Game.submitWinner(res.locals.completedGame.gameId, res.locals.winnerId, res.locals.winnerUsername, res.locals.winChance, (err, game) => {
                if(err) throw err;
                if(!game) res.json({success: false, msg:"There was an error submitting the winner."})
                return next();
            });
        } else {
            minWinNo = maxWinNo;
        }
    });
}

exports.payWinner = function(req, res){
    User.payWinner(res.locals.winnerId, res.locals.winChance, res.locals.completedGame._id, (err, user) => {
        if(err) throw err;
        // (!user) ? res.json({success: false, msg:"Winner could not be found."}) : res.json({success: true, msg:"The winner is " + user.username + " with a win % of " + res.locals.winChance + "%"});
         (!user) ? res.json({success: false, msg:"Winner could not be found."}) : console.log("The winner is " + res.locals.winnerUsername + " with a win chance of " + res.locals.winChance + "%");
    });
}


