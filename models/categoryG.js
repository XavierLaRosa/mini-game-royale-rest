// use the mongoose schema model
const { string } = require('joi');
const mongoose = require('mongoose')


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

// sub schema
var answerSchema = mongoose.Schema({
    entry: String,
    player: playerSchema,
    points: Number,
    up_votes: Number,
    down_votes: Number,
    max_votes: Number,
    approved: Boolean
},{ _id : false });

// define the schema
const categoryGSchema = new mongoose.Schema({
    type: String,
    genre: String,
    description: String,
    players: [playerSchema],
    answers: [answerSchema],
    is_done: Boolean,
    is_tie: Boolean,
    round: Number,
    current_player_turn_number: Number
})

// export categoryG schema
module.exports = mongoose.model('CategoryG', categoryGSchema)