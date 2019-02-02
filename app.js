const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

//Connect to database
mongoose.connect(config.database);
//On connection
mongoose.connection.on('connected', ()=>{
    console.log('Connected to database ' + config.database); 
});
//On connection err
mongoose.connection.on('error', (err)=>{
    console.log('Error connecting to databse ' + err); 
});

const app = express();

const users = require('./routes/users');

//set port
const port = 3000;

//cors middleware
app.use(cors());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//body parser middleware
app.use(bodyParser.json());

app.use('/users', users);

//temporary homepage route
app.get('/', (req, res)=>{
    res.send('Invalid Endpoint');
});

//Start server
app.listen(port, ()=>{
    console.log('Server started on ' + port);
});