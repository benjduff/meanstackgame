const express = require('express');
const config = require('../config/database');
const Game = require('../models/game');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const GamesController = require('../controllers/games');
const moment = require('moment');

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
        } else if(moment().isAfter(foundGame.gameEnd)){
            res.json({success: false, msg:"Game '" + foundGame.id + "' has already ended."});
        } else {
            res.json({
                success: true, 
                msg: "An active game has been returned.",
            });

            //create new instance of a game and set game values to foundGame properties
            const activeGame = new Game({ 
                id: foundGame._id,
                users: foundGame.users,
                pot: foundGame.pot,
                status: foundGame.status,
                end: foundGame.gameEnd
            });

            console.log(activeGame);
        }
    });
});


router.post('/gamble', GamesController.gameAddUser);

module.exports = router;