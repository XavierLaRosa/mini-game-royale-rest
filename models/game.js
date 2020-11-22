// use the mongoose schema model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// define the schema
const gameSchema = new mongoose.Schema({
    name: String,
    session_id: {
        type: Schema.Types.ObjectId,
        ref: "Session"
    },
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
    active: Boolean
})

// export game schema
module.exports = mongoose.model('Game', gameSchema)