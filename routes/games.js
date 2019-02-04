const express = require('express');
const config = require('../config/database');
const Game = require('../models/game');
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
    Game.addUserWhenBet(bet, (err, user) => {

    });
});

module.exports = router;