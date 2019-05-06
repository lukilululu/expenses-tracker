var express = require("express"),
    router = express.Router({mergeparams: true}),
    Expenses = require("../models/expenses");
var path = require("path"),
    mongoose = require("mongoose"),
    multer = require("multer");
var mongoURL = "mongodb://luki:hcq19961224@ds155614.mlab.com:55614/expenses";
mongoose.createConnection(mongoURL, {useNewUrlParser: true});
var fs = require("fs");
var Tesseract = require('tesseract.js');
var text, list;
var diskStorage = multer.diskStorage({
    destination: "./public/image/",
    filename: function(req, file, cb){
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
// const diskUpload = multer({des: diskStorage});
const upload = multer({storage: diskStorage});
// "file" is the name in input in form
router.post("/upload", upload.single("file"),function(req, res) {
    list = req.body.cateList;
    fs.readdir("./public/image/", function(err, files) {
        if (err) {
            console.log(err);
        } else {
            Tesseract.recognize("./public/image/" + files[files.length - 1])
                .then(function(result){
                    text = result.text;
                    console.log('result', result.text);
                });
            for (var file of files) {
                fs.unlinkSync("./public/image/" + file, function(err){
                    if (err) {
                       console.log(err);
                    }
                });
            }
        }
    });
});

//show all expenses for current user

router.get("/expenses", isLoggedIn, function(req, res){
    Expenses.find({"cuser.id": req.user._id}, function(err, allExpenses) {
        if (err) {
            console.log(err);
        }
        var today = new Date();
        var time = today.getHours();
        res.render("expenses", {expenses: allExpenses, currentUser: req.user, time: time});
    });
});

router.post("/expenses", isLoggedIn, function(req, res){
    var newCategory = req.body.category;
    var newName = req.body.name;
    var newPrice = req.body.price;
    var newDate = req.body.date;
    var cuser = {
          id: req.user._id,
          username: req.user.username
    };
    if (newName !== undefined && newCategory !== undefined && newDate !== undefined && newPrice !== undefined) {
        if (newName !== "" && newDate !== "" && newPrice !== null) {
            var newExpense = {category: newCategory, name: newName, price: newPrice, date: newDate, cuser: cuser};
            Expenses.create(newExpense, function (err, newlyCreatedExpense) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/expenses");
                }
            });
        } else {
            var msg = "cannot leave with blanks";
            res.render("new", {msg: msg});
        }
    }
    var receiptExpense = {category: ""};
    console.log("list",list);
    if (list === "Entertainment") {
        receiptExpense.category = "Entertainment";
        receiptExpense = {...receiptExpense, ...parseText(req.body.Entertainment)};
        receiptExpense.cuser = cuser;
        Expenses.create(receiptExpense);
    }
    if (list === "FoodDinning") {
        receiptExpense.category = "FoodDinning";
        receiptExpense = {...receiptExpense, ...parseText(req.body.FoodDinning)};
        receiptExpense.cuser = cuser;
        Expenses.create(receiptExpense);
    }
    if (list === "Shopping") {
        receiptExpense.category = "Shopping";
        receiptExpense = {...receiptExpense, ...parseText(req.body.Shopping)};
        receiptExpense.cuser = cuser;
        Expenses.create(receiptExpense);
    }
    if (list === "PersonalCare") {
        receiptExpense.category = "PersonalCare";
        receiptExpense = {...receiptExpense, ...parseText(req.body.PersonalCare)};
        receiptExpense.cuser = cuser;
        Expenses.create(receiptExpense);
    }
    res.redirect("/expenses");
});


function parseText(store){
    var expense;
    if (store === "Cineplex") {
        expense = {name: "ABC", price: 12.5, date: "2019-05-01"};
    }
    console.log("expense",expense);
    return expense;
}

router.delete("/expenses/:id", function(req, res) {
    console.log(req.params.id);
    Expenses.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            console.log(err);
        }
    });
    res.redirect("/expenses");
});

router.get("/expenses/new", isLoggedIn, function(req, res){
    res.render("new");
});

// determine if user logged in, use this function in middleware of router function
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = router;