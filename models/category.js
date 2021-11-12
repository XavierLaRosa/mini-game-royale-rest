// use the mongoose schema model
const { string } = require('joi');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// sub schema
var playerSchema = mongoose.Schema({
    number: Number,
    user_id: String,
    username: String,
    icon: String,
    is_winner: Boolean,
    points: Number,
    earnings: Number,
    forfeited: Boolean
},{ _id : false });

// define the schema
const categorySchema = new mongoose.Schema({
    genre: String,
    description: String,
    players: [playerSchema],
    answers: [{
        type: Schema.Types.ObjectId,
        ref: "Answer"
    }],
    is_done: Boolean,
    is_tie: Boolean,
    round: Number,
    current_player_turn_number: Number
})

// export category schema
module.exports = mongoose.model('Category', categorySchema)