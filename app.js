const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.database.host); // { autoIndex: false } set this to false in production to disable auto creating indexes
mongoose.Promise = global.Promise;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require('./services/authentication'));

app.listen(4000,()=>{
    console.log('Server started...');
});