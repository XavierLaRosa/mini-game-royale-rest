// use the mongoose schema model
const { boolean } = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// define the schema
const gameSchema = new mongoose.Schema({
    name: String,
    genre_id: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    current_turn_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    player_1_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    player_1_points: Number,
    player_2_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    player_2_points: Number,
    verified_answers: [String],
    round: Number,
    max_round: Number,
    is_done: Boolean,
    is_tie: Boolean,
    winner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

// export game schema
module.exports = mongoose.model('Game', gameSchema)