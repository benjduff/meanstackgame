const express = require('express');
const router = express.Router();

//register route
router.get('/register', (req, res, next)=>{
    res.send('REGISTER');
});

//Auth route
router.get('/authenticate', (req, res, next)=>{
    res.send('AUTHENTICATE');
});

//profile route
router.get('/profile', (req, res, next)=>{
    res.send('PROFILE');
});

//validate route
router.get('/validate', (req, res, next)=>{
    res.send('VALIDATE');
});

//export router
module.exports = router;