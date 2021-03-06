/*
 * Kevin Wu, Darian Shi, Su Jin Bang, Viwing Zheng
 * CS375/Quorum/server.js
 */

// Import mysql
const mysql = require("mysql");

// Initialize server

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use(bodyParser.json());
let filePath = "public";
app.use(express.static(filePath));

// Initialize cookie
// var sessions = require("client-sessions");
// app.use(sessions({
//     cookieName: "quorum",
//     secret: "poop",
//     duration: 60 * 60 * 1000,
//     activeDuration: 15 * 60 * 1000,
// }));

// Start server
const portNum = 8080;
app.listen(portNum, () => {
    console.log("Listening on port " + portNum);
});

// Landing page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, filePath, "login.html"));
});


// REGISTERING ENDPOINT
/* Sign-up page to catch POST request
 * This should get the profile information and upload it to the MySQL database
 */
app.post("/registered?", (req, res) => {
    console.log("\n\nAt /registered");
    res.sendFile(path.join(__dirname, filePath, "register.html"));
    console.log("POST request received at /registered?");
    let data = req.body;
    console.log(data);
    res.send("Server has handled POST request.");

    // Extract user info from clientJSON
    let username = data.user.username;
    let password = data.user.password;
    let firstName = data.user.firstName;
    let lastName = data.user.lastName;
    let age = data.user.age;
    let gender = data.user.gender;
    let gradDate = data.user.graduation;
    let major = data.user.major;
    let emerName = data.emerCont.name;
    let emerPhone = data.emerCont.phoneNum;
    let emerRel = data.emerCont.relat;

    // Create connection to MySql Server
    let con = mysql.createConnection({
        host: "localhost",
        user: "quorum",
        password: "quorum",
        database: "quorum"
    });

    // Insert new user info into the userProfiles table
    con.connect(function (err) {
        if (err) throw err;

        // TODO: check if another user with the same USERNAME or EMAIL exists, if yes, respond with error, else continue

        // Insert register.html page information as a new user into MySQL database
        let sql = "INSERT INTO userprofiles " +
          "(username, password, firstName, lastName, age, gender, gradDate, major, emergencyName, emergencyPhone, emergencyRelationship) " +
          "VALUES " +
          "(\"" + username + "\", \"" + password + "\", \"" + firstName + "\", \"" + lastName + "\", " + age + ", \"" + gender + "\", \"" + gradDate + "\", \"" + major + "\", \"" + emerName + "\", \"" + emerPhone + "\", \"" + emerRel + "\");";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Successfully added user!");
            // TODO: Send to end-user that registration was successful.
        });
    });
});

// CHECKIN ENDPOINT
app.get("/checkedin?", (req, res) => {
    console.log("\n\nAt /checkedin");

    // Parse post request
    let eventCode = req.query.eventCode;
    let userID = req.query.userID;

    // Create MySQL Connection
    let con = mysql.createConnection({
        host: "localhost",
        user: "quorum",
        password: "quorum",
        database: "quorum"
    });

    let valid = false;
    let eventID = NaN;
    let eventName = "";

    con.connect(function (err) {
        if (err) throw err;

        // Check if the event code associates to something
        let checksql = "SELECT eventID, eventName, eventCode FROM events;";
        con.query(checksql, function (err, result) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                let row = result[i];
                let tempCode = row.eventCode;
                if (eventCode === tempCode) {
                    valid = true;
                    eventID = row.eventID;
                    eventName = row.eventName;
                    break;
                }
            }

            // If the event code is valid, insert stuff in, otherwise return to the user bad stuff
            if (valid) {
                // If the event code works, then add into eventAttendance
                let insertsql = "INSERT INTO eventattendance" +
                    "(userID, eventID)" +
                    "VALUES" +
                    "(\"" + userID + "\", \"" + eventID + "\");";
                con.query(insertsql, function (err, result) {
                    if (err) throw err;
                    console.log("Successfully added an attendance row!");
                });
                res.send({"error": false, "eventName": eventName});
            } else {
                res.send({"error": true, "eventName": eventName});
            }
        });
    });
});

// LOGIN ENDPOINT
app.post("/loggedin", (req, res) => {
    console.log("\n\nAt /loggedin");
    console.log(req.body);

    let username = req.body.user;
    let password = req.body.pass;

    // Create connection to MySql Server
    let con = mysql.createConnection({
        host: "localhost",
        user: "quorum",
        password: "quorum",
        database: "quorum"
    });

    let valid = false;
    let userID = NaN;

    con.connect(function (err) {
        if (err) throw err;
        // Insert register.html page information as a new user into MySQL database
        let sql = "SELECT userID, username, password FROM userprofiles;";
        con.query(sql, function (err, result) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                let row = result[i];
                let tempUser = row.username;
                let tempPass = row.password;
                if (username === tempUser && password === tempPass) {
                    valid = true;
                    userID = row.userID;
                    // set cookie
                    // req.session.user = userID;
                    break;
                }
            }
            if (valid) {
                // TODO: send the user dashboard.html, and send them their userID to keep on client side
                res.send({"error": false, "userID": userID});
            } else {
                // TODO: tell the user they have bad info
                res.send({"error": true, "userID": userID});
            }
        });
    });
});


// INVOLVEMENT ENDPOINT
app.get("/involve", (req, res) => {
    console.log("\n\nAt /loggedin");

    let userID = req.query.userID;
    console.log("User ID: " + userID);

    // Create MySQL Connection
    let con = mysql.createConnection({
        host: "localhost",
        user: "quorum",
        password: "quorum",
        database: "quorum"
    });


    con.connect(function (err) {
        if (err) throw err;

        // Get all eventIDs for events that userID attended
        let sql1 = "SELECT userID, eventID FROM eventattendance;";
        con.query(sql1, function (err, result) {
            if (err) throw err;

            let idList = [];
            let eventList = [];

            for (let i = 0; i < result.length; i++) {
                let row = result[i];
                let tempUserID = row.userID;
                if (userID === tempUserID) {
                    idList.push(row.eventID);
                }
            }

            // Get information for each event the userID attended
            for (let j = 0; j < idList.length; j++) {
                let tempID = idList[j];
                let sql2 = "SELECT eventID, eventName, eventHostOrg, date, location FROM events WHERE eventID=" + tempID + ";";
                con.query(sql2, function (err, result) {
                    if (err) throw err;
                    eventList.push(result[0]);
                    if (j === (idList.length - 1)) {
                        res.send(eventList);
                    }
                });

            }
            //console.log(eventList);
            // If the event code is valid, insert stuff in, otherwise return to the user bad stuff
            /*if (valid) {
                // If the event code works, then add into eventAttendance
                let insertsql = "INSERT INTO eventattendance" +
                    "(userID, eventID)" +
                    "VALUES" +
                    "(\"" + userID + "\", \"" + eventID + "\");";
                con.query(insertsql, function (err, result) {
                    if (err) throw err;
                    console.log("Successfully added an attendance row!");
                });
                res.send({"error": false, "eventName": eventName});
            } else {
                res.send({"error": true, "eventName": eventName});
            } */
        });
    });
});