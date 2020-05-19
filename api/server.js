const express = require("express");
const session = require('express-session');
const router = require("./router.js");

const server = express();

const sessionConfig = {
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: process.env.SECURE_COOKIE | false,
        httpOnly: true
    },
    resave: false,
    saveUninitialized: process.env.USER_ALLOWED_COOKIES | true,
    name: "example name",
    secret: process.env.COOKIE_SECRET | "secret!"
}

server.use(express.json());
server.use(session(sessionConfig));
server.use("/api", router);

module.exports = server;