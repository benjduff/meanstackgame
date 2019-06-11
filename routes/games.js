const express = require('express');
const config = require('../config/database');
const Game = require('../models/game');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const GamesController = require('../controllers/games');
const moment = require('moment');

//CREATE GAME - PROTECT
router.post('/creategame', GamesController.findActiveGame, GamesController.createActiveGame);

//FIND ACTIVE GAME - PROTECT
router.get('/gamble', GamesController.findActiveGame);
//ADD USER TO GAME - PROTECT
router.post('/gamble', GamesController.gameAddUser);



//SET STATUS - PROTECT
router.post('/endGame/:gameId', GamesController.setComplete, GamesController.calcWinner, GamesController.payWinner);
//router.get('/gameStatus', GamesController.getGameStatus)





module.exports = router;