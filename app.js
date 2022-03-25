const express = require('express');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.database.host, { autoIndex: false }); // { autoIndex: false } set this to false in production to disable auto creating indexes
mongoose.Promise = global.Promise;

const app = express();

app.use(helmet());
app.use(cors( { origin: "https://"+config.address+':3000', credentials:true } ));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const auth = require('./routes/auth');
const { isAuthenticated } = require('./services/authentication');

app.use("/auth", auth.router);

app.use("/profile", isAuthenticated, require('./routes/profile'));
app.use("/games", require('./routes/games'));
app.use("/rooms", require('./routes/rooms'));

const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
}, app);

server.listen(8000, ()=>{
    console.log("API Server has started on port 8000");
    require('./services/gamehandler');
    require('./services/roomhandler');
});