// require express and schema dependencies
const express = require('express')
const router = express.Router()
const User = require('../models/user')

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one user
router.get('/:id', getUser, async (req, res) => {
    res.json(res.user)
})

// Create one user
const Joi = require('joi');
const schema = Joi.object({
    username: Joi.string().min(4).max(255).required(),
    password: Joi.string().min(4).max(1024).required(),
  });
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    // validate user
    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({ error: error.details[0].message });
    }

    // check if user already exists
    const isUserExist = await User.findOne({ username: req.body.username });
    if(isUserExist){
        return res.status(400).json({ error: "Username already exists" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        username: req.body.username,
        password, // hashed password
        friends: [],
        pending_friends_sent: [],
        pending_friends_received: [],
        pending_game_invites: [],
        active_games: [],
        games: []
      })
    
      try {
        const newUser = await user.save()
        res.status(201).json(newUser)
      } catch (err) {
        res.status(400).json({ message: err.message })
      }
})

// Update one user
router.put('/:id', getUser, async (req, res) => {
    if (req.body.username != null) { // check username
        res.user.username = req.body.username
    }
    if (req.body.password != null) { // check password
        res.user.password = req.body.password
    }
    // if (!arraysEqual(req.body.friends, req.user.friends)){ // check friends
    //     res.user.friends = req.body.friends
    // }
    // if (!arraysEqual(req.body.pending_friends_sent, req.user.pending_friends_sent)){ // check pending_friends_sent
    //     res.user.pending_friends_sent = req.body.pending_friends_sent
    // }
    // if (!arraysEqual(req.body.pending_friends_received, req.user.pending_friends_received)){ // check pending_friends_received
    //     res.user.pending_friends_received = req.body.pending_friends_received
    // }
    // if (!arraysEqual(req.body.pending_game_invites, req.user.pending_game_invites)){ // check pending_game_invites
    //     res.user.pending_game_invites = req.body.pending_game_invites
    // }
    // if (!arraysEqual(req.body.active_games, req.user.active_games)){ // check active_games
    //     res.user.active_games = req.body.active_games
    // }
    // if (!arraysEqual(req.body.games, req.user.games)){ // check games
    //     res.user.games = req.body.games
    // }

    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Delete one user
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json({ message: 'Deleted This User' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Reusable function thats gets a single user, helpful for GET by id, UPDATE, DELETE
async function getUser(req, res, next) {
    try {
      user = await User.findById(req.params.id)
      if (user == null) {
        return res.status(404).json({ message: 'Cant find user'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.user = user
    next() // move onto the next section of code (the rest of the specific route method logic)
  }
module.exports = router

// helper method to check if arrays match
function arraysEqual(a, b) {
    if(!a && !b){
        console.log("both undefined")
    } else if(a && !b){
        console.log("current undefined")
    } else if(!a && b){
        console.log("new undefined")
    }
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}