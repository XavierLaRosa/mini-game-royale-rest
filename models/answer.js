// use the mongoose schema model
const { string } = require('joi');
const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    entry: String,
    time: Number,
    player: String,
    points: Number,
    up_votes: [String],
    down_votes: [String],
    max_votes: Number,
    pending: Boolean,
    approved: Boolean
});

// export answer schema
module.exports = mongoose.model('Answer', answerSchema)