const express = require('express');
const config = require('../config/database');
const Game = require('../models/game');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');

//create game - PROTECT
router.post('/creategame', (req, res, next) => {
    //create new instance of game, set game status to active (currently no way of checking for more than one active game as of v1.0.1)
    let newGame =  new Game({
        users: req.body.users,
        pot: req.body.pot,
        status: "active" 
    });

    Game.createGame(newGame, (err, game) => {
        if(err){
            res.json({success: false, msg: "Failed to create game!"});
        } else {
            res.json({success: true, msg: "Game created successfully!"});
        }
    });
});

//PROTECT
router.get('/gamble', (req,res,next) => {

    //find a active game (should only be 1 anyway) and return game as 'foundGame'
    Game.findActiveGame((err, foundGame) => { 
        if(err) throw err;
        if(!foundGame) {
            res.json({success: false, msg: 'There are no currently active games!'});
        } else {
            //CHECK FOR 3 OR MORE PLAYERS IN THE GAME
            res.json({
                success: true, 
                msg: "A active game has been returned.",
            });

            //create new instance of a game and set game values to foundGame properties
            const activeGame = new Game({ 
                id: foundGame._id,
                users: foundGame.users,
                pot: foundGame.pot,
                status: foundGame.status
            });

            console.log(activeGame);
        }
    });
});


router.post('/gamble', (req,res,next) => {
    const user = {
        id: req.body.id,
        bet: req.body.bet,
        username: req.body.username
    }    
    //get the user by id
    User.getUserById(user.id, (err, foundUser) => {
        if(err) throw err;
        //check if bet > balance or balance <=0 and return appropriate
        if(user.bet > foundUser.balance || foundUser.balance <= 0){
            res.json({success: false, msg:"Funds not available!"});
        } else {
            const updatedBalance = foundUser.balance -= user.bet;
            //pass this updatedBalance to User.makeBet
            User.makeBet(user.id, updatedBalance, (err, updatedUser) => {
                if(err) throw err;
                if(!updatedUser){
                    res.json({success: false, msg:"Something went wrong making the bet!"});
                } else {
                    Game.findActiveGame((err, currentGame) => {
                        if(err) throw err;
                        if(!currentGame){
                            res.json({success: false, msg:"There is no current game!"});
                        } else {
                            Game.addUserUpdatePot(user.username, user.bet, currentGame._id, currentGame.pot, (err, thisgame) => {
                                if(err) throw err;
                                    //CHECK FOR 3 OR MORE PLAYERS IN THE GAME
                                    if(thisgame.users.length >= 2 && thisgame.gameEnd == undefined){
                                        Game.startGame(thisgame._id, (err) => {
                                            if(err)throw err;
                                            res.json({success: true, msg: "The game has started and will end at: " +thisgame.gameEnd});
                                        });
                                    } else {
                                        res.json({success: true, msg: "game has already started!"});
                                    }
                                });
                            }
                        });
                    }
                });
            }
     });
});

module.exports = router;