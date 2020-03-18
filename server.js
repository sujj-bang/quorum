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

// Create connection to MySql Server
const con = mysql.createConnection({
    host: "localhost",
    user: "quorum",
    password: "quorum",
    database: "quorum"
});

// Landing page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, filePath, "login.html"));
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

    var username = "test";
    var password = "test";
    var firstName = "test";
    var lastName = "test";
    var age = "20";
    var gender = "test";
    var gradDate = "test";
    var major = "test";
    var emerName = "test";
    var emerPhone = "test";
    var emerRel = "test";

    // Insert new user info into the userProfiles table
    con.connect(function(err) {
        if (err) throw err;
        let sql = "INSERT INTO userprofiles " +
            "(username, password, firstName, lastName, age, gender, gradDate, major, emergencyName, emergencyPhone, emergencyRelationship) " +
            "VALUES " +
            "(\"" + username + "\", \"" + password + "\", \"" + firstName  + "\", \"" + lastName + "\", " + age + ", \"" + gender + "\", \"" + gradDate + "\", \"" + major + "\", \"" + emerName + "\", \"" + emerPhone + "\", \"" + emerRel + "\");";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Successfully added user!");
        });
    });
});

// Handle check in
app.get("/checkin?", (req, res) => {
    let sendData = {};
    let eventCode = req.query.eventCode;
    if (isNaN(eventCode) || eventCode === "") {
        sendData.error = true;
    } else {
        sendData.error = false;
    }
    console.log(sendData);
    console.log(eventCode);
    res.json(sendData);
});

