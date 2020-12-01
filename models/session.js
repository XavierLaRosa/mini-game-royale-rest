// use the mongoose schema model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// define the schema
const sessionSchema = new mongoose.Schema({
    game_id: {
        type: Schema.Types.ObjectId,
        ref: "Game"
    },
    player_1_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    player_1_wins: Number,
    player_2_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    player_2_wins: Number
})

// export session schema
module.exports = mongoose.model('Session', sessionSchema)