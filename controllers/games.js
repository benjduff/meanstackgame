const express = require('express');
const config = require('../config/database');
const Game = require('../models/game');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const GamesController = require('../controllers/games');

exports.gameAddUser =  

(req,res,next) => {
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
                        res.json({success: true, msg:"user added to game, pot updated successfully."});
                        const currentGame = new Game({
                            id: updatedGame._id,
                            users: updatedGame.users,
                            pot: updatedGame.pot,
                            status: updatedGame.status
                        });
                        console.log(currentGame); 
                    }
                });
            });
        }
    });




    // User.getUserById(user.id, (err, foundUser) => {
    //     if (err) throw err;
    //     //check if bet > balance or balance <=0 and return appropriate
    //     if (user.bet > foundUser.balance || foundUser.balance <= 0) {
    //         res.json({ success: false, msg: "Funds not available!" });
    //     } else {
    //         const updatedBalance = foundUser.balance -= user.bet;
    //         const ticketValue = user.bet * 0.01;
    //         //pass this updatedBalance to User.makeBet
    //         User.makeBet(user.id, updatedBalance, (err, updatedUser) => {
    //             if (err) throw err;
    //             if (!updatedUser) {
    //                 res.json({ success: false, msg: "Something went wrong making the bet!" });
    //             } else {
    //                 Game.findActiveGame((err, currentGame) => {
    //                     if (err) throw err;
    //                     if (!currentGame) {
    //                         res.json({ success: false, msg: "There is no current game!" });
    //                     } else {
    //                         const userTickets = new Array[ticketValue];
    //                         const totalGameTickets = currentGame.tickets + userTickets;
    //                         Game.addUserUpdatePot(user.bet, currentGame._id, currentGame.pot, user.id, userTickets, totalGameTickets, (err, thisgame) => {
    //                             if (err) throw err;
    //                             //CHECK FOR 3 OR MORE PLAYERS IN THE GAME
    //                             if (thisgame.users.length >= 2 && thisgame.gameEnd == undefined) {
    //                                 Game.startGame(thisgame._id, (err) => {
    //                                     if (err) throw err;
    //                                     res.json({ success: true, msg: "The game has started and will end at: " + thisgame.gameEnd });
    //                                 });
    //                             } else {
    //                                 setTimeout(Game.calcWinner(thisgame.id, user, (err, winner) => {
    //                                     if (err) throw err;
    //                                     res.json({ success: true, msg: "The winner of this game is " + winner });
    //                                 }), 45000);
    //                             }
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // })
}


