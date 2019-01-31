var express = require("express"),
    router = express.Router({mergeparams: true}),
    passport = require("passport"),
    User = require("../models/user");


router.get("/", function(req, res){
    res.render("home");
});



//auth router for register
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    //get inputs from html and register
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            // fail to register, direct to register page
            return res.render("register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/expenses");
            });
        }
    });
});

//auth router for login
router.get("/login", function(req, res){
    res.render("login");
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/expenses",
    failureRedirect: "/login"
}), function(req, res){
    // TODO: ???
});

//logout
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// TODO: ocr handle
router.post("/ocr", function(req, res){
    res.redirect("/login");
    // const ocrApi = "ecf46b3ba088957",
    //     ocrBaseUrl = "https://api.ocr.space/parse/imageurl?";
    // var imgUrl = "http://i.imgur.com/fwxooMv.png";
    // xhr.open("POST", ocrBaseUrl + "apikey=" + ocrApi + "url=" + imgUrl);  
    // xhr.onreadystatechange = function() { 
    //     if (xhr.readyState == 4 && xhr.status == 200) {
    //         var ocrResult = xhr.responseText; 
    //         console.log(ocrResult);
    //     }
    // };
});

// determine if user logged in, use this function in middleware of router function
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = router;