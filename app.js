const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.database.host, { autoIndex: false }); // { autoIndex: false } set this to false in production to disable auto creating indexes
mongoose.Promise = global.Promise;

const app = express();

app.use(helmet());
app.use(cors( { origin:'http://localhost:3000', credentials:true } ));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const auth = require('./routes/auth');
const { isAuthenticated } = require('./services/authentication');

app.use("/auth", auth.router);

app.use("/profile", isAuthenticated, require('./routes/profile'));
app.use("/games", require('./routes/games'));

app.listen(8000,()=>{
    require('./services/gamehandler');
});