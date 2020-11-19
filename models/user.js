// use the mongoose schema model
const mongoose = require('mongoose')

// define the schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    friends: [String],
    pending_friends_sent: [String],
    pending_friends_received: [String],
    pending_game_invites: [String],
    active_games: [String],
    games: [String],
    date_created: {
      type: Date,
      default: Date.now,
    }
})

// export user schema
module.exports = mongoose.model('User', userSchema)