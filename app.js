const express = require('express');
const mongoose = require('mongoose');
let user = require('./router/user');

let app = express();
mongoose.connect('mongodb://localhost:27017/marmeto');
let connection = mongoose.connection;
connection.on('open', ()=>{
    console.log('mongodb connected');
});
connection.on('error', (err)=>{
    console.log(err);
})

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/users', user);

app.get('*', (req, res)=>{
    res.send('hello world');
});

app.listen(3000, ()=>{
    console.log('server running on port 3000')
})