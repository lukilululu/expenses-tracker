var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    Grid = require("gridfs-stream"),
    User = require("./models/user");
    
//require routes
var expenseRoutes = require("./routes/expenseRoutes");
var indexRoutes = require("./routes/indexRoutes");

//Set up default mongoose connection
var mongoURL = "mongodb://luki:hcq19961224@ds155614.mlab.com:55614/expenses";
mongoose.connect(mongoURL);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "hehe",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//use currentUser = req.user everywhere
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use(expenseRoutes);
app.use(indexRoutes);


var port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));