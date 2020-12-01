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
    User.findOne({ _id: res.user._id })
        .populate('friends', 'username').
        populate('pending_friends_sent', 'username').
        populate('pending_friends_received', 'username').
        populate('games').
        populate('pending_games_sent').
        populate({ 
            path: 'pending_games_sent',
            populate: {
              path: 'player_1_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'pending_games_sent',
            populate: {
              path: 'player_2_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'pending_games_sent',
            populate: {
              path: 'current_turn_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate('pending_games_received').
        populate({ 
            path: 'pending_games_received',
            populate: {
              path: 'player_1_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'pending_games_received',
            populate: {
              path: 'player_2_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'pending_games_received',
            populate: {
              path: 'current_turn_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'player_1_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'player_2_id',
              model: 'User',
              select: 'username'
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'current_turn_id',
              model: 'User',
              select: 'username'
            } 
        }).
        exec(function (err, u) {
            if (err) return handleError(err);
            res.user = u
            res.json(res.user)
        })
})

// Get list of matching users
router.get('/contains/:keyword', async (req, res) => {
    try {
        User.find({ "username": { "$regex": req.params.keyword} })
        .select('username')
        .exec(function (err, u) {
            res.json(u)
        })


    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Send a friend request
router.put('/friend-request/sender/:sid/receiver/:id', getUser, async (req, res) => {
    try {
        res.user.pending_friends_received.push(req.params.sid)
        res.user.save()
        console.log("changed 1: ", res.user)
        res.json({message: "friend request sent"})

        User.findOne({ _id: req.params.sid}).
        exec(function (err, u) {
            if (err) return handleError(err);
            u.pending_friends_sent.push(req.params.id)
            u.save()
            console.log("change", u)
        })
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Confirm friend request sent
router.put('/friend-request/sender/:id/receiver/:rid/confirm', getUser, async (req, res) => {
    // try {
    //     res.user.pending_friends_sent.push(req.params.rid)
    //     try {
    //         const updatedUser = await res.user.save()
    //         res.json(updatedUser)
    //     } catch {
    //         res.status(400).json({ message: err.message })
    //     }
    // } catch {
    //     res.status(400).json({ message: err.message })
    // }
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
        return res.status(400).json({ message: error.details[0].message });
    }

    // check if user already exists
    const isUserExist = await User.findOne({ username: req.body.username });
    if(isUserExist){
        return res.status(400).json({ message: "Username already exists" });
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
        pending_games_sent: [],
        pending_games_received: [],
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

// Post login user
router.post("/login", async (req, res) => {
    // validate the user
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // throw error if username is wrong
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: "Username is incorrect" });
    
    // check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
    return res.status(400).json({ message: "Password is incorrect" });

    // create jwt token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
        // payload data
        {
            username: user.username,
            id: user._id,
        },
        process.env.TOKEN_SECRET
    );
    res.header("auth-token", token).json({
        message: "Login successful",
        token,
        user: user
    });
  });

// Update one user
router.put('/:id', getUser, async (req, res) => {
    if (req.body.username != null) { // check username
        res.user.username = req.body.username
    }
    if (req.body.password != null) { // check password
        res.user.password = req.body.password
    }
    if (req.body.friends != null){ // check friends
        res.user.friends = req.body.friends
    }
    if (req.body.pending_friends_sent != null){ // check pending_friends_sent
        res.user.pending_friends_sent = req.body.pending_friends_sent
    }
    if (req.body.pending_friends_received != null){ // check pending_friends_received
        res.user.pending_friends_received = req.body.pending_friends_received
    }
    if (req.body.pending_games_sent != null){ // check pending_games_sent
        res.user.pending_games_sent = req.body.pending_games_sent
    }
    if (req.body.pending_games_received != null){ // check pending_games_received
        res.user.pending_games_received = req.body.pending_games_received
    }
    if (req.body.games != null){ // check games
        res.user.games = req.body.games
    }

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