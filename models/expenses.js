// schema setup
var mongoose = require("mongoose");
var expensesSchema = new mongoose.Schema({
    category: String,
    name: String,
    price: Number,
    date: String,
    cuser: {
        id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: String}
});

module.exports = mongoose.model("Expenses", expensesSchema);


// Expenses.create({
//         category: "food",
//         name: "tripeO",
//         price: 12,
//         date: "2018-12-20"
//     }, function(err, expense){
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("newly created expense");
//             console.log(expense);
//         }
//     });

// var expenses = [{
//         category: "food",
//         name: "tripeO",
//         price: 12,
//         date: "2018-12-20"
//     },
//     {
//         category: "drink",
//         name: "starbucks",
//         price: 5.5,
//         date: "2019-01-01"
//     },
//     {
//         category: "clothing",
//         name: "HM",
//         price: 50,
//         date: "2019-01-04"
//     }];
    