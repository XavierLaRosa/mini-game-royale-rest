// use the mongoose schema model
const mongoose = require('mongoose')

// define the schema
const sessionSchema = new mongoose.Schema({
    game_id: String,
    player_1_id: String,
    player_1_wins: Number,
    player_2_id: String,
    player_2_wins: Number
})

// export session schema
module.exports = mongoose.model('Session', sessionSchema)