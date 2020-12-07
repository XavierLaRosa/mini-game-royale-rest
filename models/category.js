// use the mongoose schema model
const mongoose = require('mongoose')


// sub schema
var subSchema = mongoose.Schema({
    key: String,
    value: [String]
},{ _id : false });

// define the schema
const categorySchema = new mongoose.Schema({
    category: String,
    answers: [subSchema]
})

// export category schema
module.exports = mongoose.model('Category', categorySchema)