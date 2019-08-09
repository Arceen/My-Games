var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var bodyparser = require('body-parser');
var express = require('express');
var app = express();
var urlencoderParser = bodyparser.urlencoded({ extended: false });
var cookieParser = require('cookie-parser');
var session = require('express-session');
var cors = require('cors');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "niloy",
    database: "mydb"
});
//Some info like the active users, online users, total users this month etc will be shared across all webpages
//So, Im going to make a separate folder that keeps these files in store and uses them accordingly
//Also there is a chance of me adding some functionality for some particular users
//They will have some features given to them in that shared folder also
app.use(cors())
app.use(cookieParser());
app.use(session({ secret: "Shh, its a secret!" }));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
app.get('/', function(req, res) {
    console.log("Home page");
    //delete the login and logout stuff if a session flag variable exists(Use this to see if the user is logged in or not)
    //If logged in remove the sign in sign up options
    //replace them with user's profile link, messeges and logout options
    //Also send a flag to say whether a user is logged in or not and show them what they should be able to see
    if (req.session.loggedin == "Yes") {
        //This means they are logged in, so we show them their personal info, message link, and logout options.
        res.render('profile', { loggedin: req.session.loggedin, email: req.session.email });

    } else {
        res.render('profile', { loggedin: "No" });
    }
});
// app.get('/:email&:pass', function(req, res) {
//     console.log('doing email and pass');
//     strem = req.params.email.split("=");
//     strpass = req.params.pass.split("=");
//     console.log(strem);
//     console.log(strpass)
//     if (strem[0] != 'email' || strpass[0] != 'pass' || (strem.length + strpass < 4)) {
//         res.send('Email and password fake');
//         console.log("fake em & pass")

//     } else {
//         req.session.email = stream[1];
//         res.render('profile', { email: strem[1], pass: strpass[1] });

//     }
// });
app.get('/messages', function(req, res) {
    if (req.session.loggedin = "Yes") {
        res.render('messages', { email: req.session.email });
    } else {
        msg = "You are not logged in.";
        console.log(msg);
        res.render('profile', { errmsg: msg });
    }
});
app.get('/logout', function(req, res) {
        req.session.destroy();
        req.loggedin = "No";
        res.render('profile', { errmsg: "You have been logged out successfully." });
    })
    // app.get('/:errmsg', function(req, res) {
    //     console.log("Inside error 1")
    //     res.render('profile', { errmsg: req.params.errmsg });
    // });
app.get('/contact', function(req, res) {
    res.send('this is the contact page');
})
app.get('/getpastmessages', function(req, res) {
    console.log("this past messages shit is being called");
    var sql = "Select * from messages order by msg_id desc limit 30";
    con.query(sql, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            console.log(result.length);
            jres = {};
            for (i = result.length - 1; i >= 0; i--) {
                jres[result.length - 1 - i] = {
                    "from": result[i].msg_from,
                    "to": result[i].msg_to,
                    "msg": result[i].msg_loc
                };

                console.log(jres);
                console.log("here");
            }
            console.log(jres);
            res.json(jres);
        }


    })
});

app.post('/sendmessage', urlencoderParser, function(req, res) {
    var msg = req.body['msg'];
    console.log(msg);
    console.log("this past messages shit is being called");
    var from = "Anonymous"
    if (req.session.loggedin == "Yes" && req.session.email) {
        from = req.session.email;
    }
    var sql = "Insert into messages(msg_from, msg_to, msg_loc) Values (\'" + from + "\', '" + to + "\', \'" + msg + "\')";
    var to = "All"
    var dt = new Date();
    console.log("here without errors");
    con.query(sql, function(err, result) {
        if (err)
            console.log(err);
        if (result.length > 0) {
            console.log("success");
            res.send("got it");
        }


    })
    res.send("got it");
});


app.get('*', function(req, res) {
    res.send('I am 99% sure you\'re on the wrong page');
});
app.get('/profile/:id', function(req, res) {
    res.send('You requested to see a profile with the id of ' + req.params.id);
});
//Messages div may request the all the recent messages sent
//over a time period
//I need to create a dummy request that sends that data over a
//connection which gives a json response with all our 
//required data

app.post('/login', urlencoderParser, function(req, res) {

    em = req.body['email'];
    pw = req.body['pwd'];
    console.log(em);
    console.log(pw);
    console.log(req.headers);
    var sql = "Select * from users Where email = ? and pass = ?";
    con.query(sql, [em, pw], function(err, result) {
        if (err) throw err;
        console.log(result);
        if (result.length > 0) {

            console.log(result[0].email);
            console.log(result[0].pass);
            req.session.loggedin = "Yes";
            req.session.email = result[0].email;
            res.render('profile', { loggedin: "Yes", email: result[0].email });


        } else {
            msg = "Wrong Login Credentials.";
            console.log(msg);
            res.render('profile', { errmsg: msg });

        }
    });


});

app.post('/signup', function(req, res) {
    res.send('You Tried to signup');
    var sql = "INSERT INTO users (email, pass) VALUES ?";
    em = req.body['email'];
    pw = req.body['pwd'];
    item = [
        [em, pw]
    ];
    console.log(em);
    console.log(pw);
    console.log(req.headers);
    con.query(sql, [item], function(err, result) {
        if (err) throw err;
        console.log(result);
    });


    res.render('profile', { errmsg: "Login now please" });
});

app.listen(3000);