/*
 * Kevin Wu, Darian Shi, Su Jin Bang, Viwing Zheng
 * CS375/Quorum/server.js
 */

// Imports
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

// Initialize server
const app = express();
app.use(bodyParser.json());
let filePath = "public";
app.use(express.static(filePath));

// Start server
const portNum = 8080;
app.listen(portNum, () => {
    console.log("Listening on port " + portNum);
});

// Landing page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, filePath, "login.html"));
});

// Sign-up page
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, filePath, "register.html"));
});

/* Sign-up page to catch POST request
 * This should get the profile information and upload it to the MySQL database
 */
app.post("/registered?", (req, res) => {
    res.sendFile(path.join(__dirname, filePath, "register.html"));
    console.log("POST request received at /registered?");
    let data = req.body;
    console.log(data);
    res.send("Server has handled POST request.");
});

// Handle check in
app.get("/checkedin?", (req, res) => {
    let sendData = {};
    let eventCode = req.query.eventCode;
    sendData.error = isNaN(eventCode) || eventCode === "";
    console.log("My response: " + sendData);
    console.log("Event code: " + eventCode);
    res.json(sendData);
});

// Handle log in
app.post("/loggedin", (req, res) => {
    console.log(req.body);
    // TODO: DO SQL Stuff to check if valid user

    // TODO: Tell user that he is logged in
});
