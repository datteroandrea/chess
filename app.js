const express = require("express");
const http = require('http');
const https = require('https');
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const app = express();
//const config = require("./config");
//const passport = require("passport");
//const credentials = { key: fs.readFileSync('ssl/generalscience_io.key', 'utf-8'), cert: fs.readFileSync('ssl/generalscience_io.crt', 'utf-8'), ca: fs.readFileSync('ssl/generalscience_io.ca-bundle', 'utf-8') };

console.log("Server session secret: "+randomUUID());

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  require("express-session")({
    secret: "" + randomUUID(),
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60 * 60 * 1000 * 24 * 365,
    },
  })
);

app.get("/", (req, res)=>{
    res.send("Hello world!");
});

// app.use('/auth', require('./api/auth'));

var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

httpServer.listen(4000,'localhost',()=>{
	console.log("App started on port:"+4000);
});