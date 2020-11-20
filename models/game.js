// use the mongoose schema model
const mongoose = require('mongoose')

// define the schema
const gameSchema = new mongoose.Schema({
    name: String,
    session_id: String,
    genre_id: String,
    current_turn_id: String,
    player_1_id: String,
    player_1_points: Number,
    player_2_id: String,
    player_2_points: Number,
    verified_answers: [String],
    round: Number,
    max_round: Number
})

// export game schema
module.exports = mongoose.model('Game', gameSchema)