// use the mongoose schema model
const { string } = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
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
    icon: {
        type: String,
        required: true
    },
    gold: {
        type: Number
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    pending_friends_sent: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    pending_friends_received: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    pending_games_sent: [{
        type: Schema.Types.ObjectId,
        ref: "Game"
    }],
    pending_games_received: [{
        type: Schema.Types.ObjectId,
        ref: "Game"
    }],
    games: [{
        type: Schema.Types.ObjectId,
        ref: "Game"
    }],
    date_created: {
      type: Date,
      default: Date.now,
    }
})

// export user schema
module.exports = mongoose.model('User', userSchema)