// use the mongoose schema model
const mongoose = require('mongoose')

// define the schema
const categorySchema = new mongoose.Schema({
    category: String,
    answers: [String]
})

// export category schema
module.exports = mongoose.model('Category', categorySchema)