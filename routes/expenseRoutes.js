var express = require("express"),
    router = express.Router({mergeparams: true}),
    Expenses = require("../models/expenses");
var path = require("path"),
    mongoose = require("mongoose"),
    crypto = require("crypto"),
    multer = require("multer"),
    GridFsStorage = require("multer-gridfs-storage"),
    Grid = require("gridfs-stream"),
    methodOverride = require("method-override");
var okrabyte = require("okrabyte");
var request = require("request");
var mongoURL = "mongodb://luki:hcq19961224@ds155614.mlab.com:55614/expenses";
var conn = mongoose.createConnection(mongoURL);
var gfs;
var fs = require("fs");
conn.once("open", function(){
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

var storage = new GridFsStorage({
    url: mongoURL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
const upload = multer({ storage });
// "file" is the name in input in form
router.post("/upload", upload.single("file"), function(req, res) {
    // return json file info
    // res.json({file: req.file});
    res.redirect("expenses");
});

//show all expenses for current user

router.get("/image/:filename", function(req, res){
    gfs.files.findOne({filename: req.params.filename}, function(err, file) {
        if (!file || file.length === 0) {
            return res.status(404).json({err: "no file"});
        }
        if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: "not an image"
            });
        }
    });
});

router.get("/files", function(req, res){
    gfs.files.find().toArray(function(err, files) {
        //check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: "no file"
            })
        }
        return res.json(files);
    });
});

router.get("/result", function(req, res){
    // var buffer = fs.readFileSync("./public/image/reciept.jpg");
    // okrabyte.decodeBuffer(buffer, function(error, data){
    //     console.log(data);
    // });
    okrabyte.decodeFile("./public/image/reciept.jpg", function(error, data){
        console.log(data); // Hello World!
    });
});

router.get("/expenses", isLoggedIn, function(req, res){
    console.log("username is ??");
    console.log("username is "+ req.user.username);
    Expenses.find({"cuser.id": req.user._id}, function(err, allExpenses){
        if (err) {
            console.log(err);
        }
        gfs.files.find().toArray(function(err, files){
            //check if files
            if (err) {
                console.log(err);
            }
            if (!files || files.length === 0) {
                res.render("expenses", {files: false});
            }
            files.map(file => {
                file.isImage = file.contentType === "image/jpeg" || file.contentType === "image/png";
            });
            res.render("expenses", {expenses: allExpenses, currentUser: req.user, files: files});
        });
    });
});

router.delete("/files/:id", function(req, res) {
    gfs.remove({_id: req.params.id, root: "uploads"}, function(err, gridStore){
        if (err) {
            return res.status(404).json({err: err});
        }
        res.redirect("/expenses");
    })
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
    if (newCategory !== null && newName !== null && newDate !== null && newPrice !== null) {
        var newExpense = {category:newCategory, name:newName, price:newPrice, date:newDate, cuser: cuser};
        console.log(req.user._id);
        console.log(req.user.username);
        // newExpense.users.id = req.user._id;
        Expenses.create(newExpense, function(err, newlyCreatedExpense){
            if (err) {
                console.log(err);
            } else {
                console.log("hello" + newlyCreatedExpense);
                res.redirect("/expenses");     
            }
        });
    } else {
        // var errMsg = document.getElementsByTagName("h3");
        var msg = "cannot leave with blanks";
        res.render("new", {msg: msg});
        // console.log("cannot leave with blanks");
    }
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