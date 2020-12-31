// require express and schema dependencies
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Game = require('../models/game')

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
        .populate('friends', ['username','icon']).
        populate('pending_friends_sent', ['username','icon']).
        populate('pending_friends_received', ['username','icon']).
        populate('games').
        populate('pending_games_sent').
        populate({ 
            path: 'pending_games_sent',
            populate: {
              path: 'player_1_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'pending_games_sent',
            populate: {
              path: 'player_2_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'pending_games_sent',
            populate: {
              path: 'current_turn_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate('pending_games_received').
        populate({ 
            path: 'pending_games_received',
            populate: {
              path: 'player_1_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'pending_games_received',
            populate: {
              path: 'player_2_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'pending_games_received',
            populate: {
              path: 'current_turn_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'player_1_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'player_2_id',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'winner',
              model: 'User',
              select: ['username','icon']
            } 
        }).
        populate({ 
            path: 'games',
            populate: {
              path: 'current_turn_id',
              model: 'User',
              select: ['username','icon']
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
        .select(['username', 'icon'])
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
        if(res.user.friends.includes(req.params.sid)){
            res.json({message: "already friends"})
        } else if(res.user.pending_friends_received.includes(req.params.sid)){
            res.json({message: "friend request already sent"})
        } else {
            res.user.pending_friends_received.push(req.params.sid)
            res.user.save()

            User.findOne({ _id: req.params.sid}).
            exec(function (err, u) {
                if (err) return handleError(err);
                u.pending_friends_sent.push(req.params.id)
                u.save()
            })

            res.json({message: "friend request sent"})
        }
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Unsend a friend request
router.put('/friend-request/sender/:sid/receiver/:id/unsend', getUser, async (req, res) => {
    try {
        if(res.user.pending_friends_received.includes(req.params.sid)){
            console.log("in if")
            const index = res.user.pending_friends_received.indexOf(req.params.sid)
            res.user.pending_friends_received.splice(index, 1)
            console.log("index: ", index)
            User.findOne({ "_id": req.params.sid })
                .exec(function (err, u) {
                    console.log("U: ", u)
                    if(err){
                        res.status(400).json(err.message)
                    }
                    if(u.pending_friends_sent.includes(req.params.id)){
                        const index = u.pending_friends_sent.indexOf(req.params.id)
                        console.log("index: ", index)
                        u.pending_friends_sent.splice(index, 1)
                        u.save()
                        res.user.save()
                        res.json(u)
                    } 
                })
        } else {
            console.log("in else")
            res.status(400).json({ message: "could not unsend friend request" })
        }
    } catch {
        res.status(400).json({ message: "message" })
    }
})

// Confirm a friend request
router.put('/friend-request/sender/:sid/receiver/:id/confirm', getUser, async (req, res) => {
    try {
        if(res.user.pending_friends_sent.indexOf(req.params.sid) >= 0){
            res.user.pending_friends_sent.splice(res.user.pending_friends_sent.indexOf(req.params.sid), 1)
            res.user.friends.push(req.params.sid)
            res.user.save()
    
            User.findOne({ _id: req.params.sid}).
            exec(function (err, u) {
                if (err) return handleError(err);
                if(u.pending_friends_received.indexOf(req.params.id) >= 0){
                    u.pending_friends_received.splice(u.pending_friends_received.indexOf(req.params.id), 1)
                    u.friends.push(req.params.id)
                    u.save()
                    res.json({message: "confirmed friend request"})
                } else {
                    res.status(500).json({ message: "friends do not match" })
                }
            })
        } else {
            res.status(500).json({ message: "friends do not match" })
        }

    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Decline a friend request
router.put('/friend-request/sender/:sid/receiver/:id/decline', getUser, async (req, res) => {
    try {
        if(res.user.pending_friends_sent.indexOf(req.params.sid) >= 0){
            res.user.pending_friends_sent.splice(res.user.pending_friends_sent.indexOf(req.params.sid), 1)
            res.user.save()
    
            User.findOne({ _id: req.params.sid}).
            exec(function (err, u) {
                if (err) return handleError(err);
                if(u.pending_friends_received.indexOf(req.params.id) >= 0){
                    u.pending_friends_received.splice(u.pending_friends_received.indexOf(req.params.id), 1)
                    u.save()
                    res.json({message: "declined friend request"})
                } else {
                    res.status(500).json({ message: "friends do not match" })
                }
            })
        } else {
            res.status(500).json({ message: "friends do not match" })
        }

    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Remove a friend
router.put('/friends/sender/:sid/receiver/:id/remove', getUser, async (req, res) => {
    try {
        if(res.user.friends.indexOf(req.params.sid) >= 0){
            res.user.friends.splice(res.user.friends.indexOf(req.params.sid), 1)
            res.user.save()
    
            User.findOne({ _id: req.params.sid}).
            exec(function (err, u) {
                if (err) return handleError(err);
                if(u.friends.indexOf(req.params.id) >= 0){
                    u.friends.splice(u.friends.indexOf(req.params.id), 1)
                    u.save()
                    res.json({message: "removed friend"})
                } else {
                    res.status(500).json({ message: "friends do not match" })
                }
            })
        } else {
            res.status(500).json({ message: "friends do not match" })
        }

    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Send a game request
router.put('/game-request/game/:gid/sender/:sid/receiver/:id', getUser, async (req, res) => {
    try {
        res.user.pending_games_received.push(req.params.gid)
        res.user.save()
        res.json({message: "game request sent"})

        User.findOne({ _id: req.params.sid}).
        exec(function (err, u) {
            if (err) return handleError(err);
            u.pending_games_sent.push(req.params.gid)
            u.save()
        })
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Confirm game request
router.put('/game-request/game/:gid/sender/:id/receiver/:rid/confirm', getUser, async (req, res) => {
    try {
        if(res.user.pending_games_received.indexOf(req.params.gid) >= 0){
            res.user.pending_games_received.splice(res.user.pending_games_received.indexOf(req.params.gid), 1);
        }
        res.user.games.push(req.params.gid)
        res.user.save()
        res.json({message: "game request sent"})

        User.findOne({ _id: req.params.rid}).
        exec(function (err, u) {
            if (err) return handleError(err);
            if(u.pending_games_sent.indexOf(req.params.gid) >= 0){
                u.pending_games_sent.splice(u.pending_games_sent.indexOf(req.params.gid), 1);
            }
            u.games.push(req.params.gid)
            u.save()
        })
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Decline game request
router.put('/game-request/game/:gid/sender/:id/receiver/:rid/decline', getUser, async (req, res) => {
    try {
        if(res.user.pending_games_received.indexOf(req.params.gid) >= 0){
            res.user.pending_games_received.splice(res.user.pending_games_received.indexOf(req.params.gid), 1);
        }
        res.user.save()

        User.findOne({ _id: req.params.rid}).
        exec(function (err, u) {
            if (err) return handleError(err);
            if(u.pending_games_sent.indexOf(req.params.gid) >= 0){
                u.pending_games_sent.splice(u.pending_games_sent.indexOf(req.params.gid), 1);
            }
            u.save()
        })
        Game.findOne({_id: req.params.gid}).
            exec(function (err, g) {
                if (err) return handleError(err);
                g.remove()
                res.json({message: "delete game request sent"})
        })
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Unsend game request
router.put('/game-request/game/:gid/sender/:id/receiver/:rid/unsend', getUser, async (req, res) => {
    try {
        if(res.user.pending_games_sent.indexOf(req.params.gid) >= 0){
            res.user.pending_games_sent.splice(res.user.pending_games_sent.indexOf(req.params.gid), 1);
            res.user.save()

            User.findOne({ _id: req.params.rid}).
            exec(function (err, u) {
                if (err) return handleError(err);
                if(u.pending_games_received.indexOf(req.params.gid) >= 0){
                    u.pending_games_received.splice(u.pending_games_received.indexOf(req.params.gid), 1);
                    u.save()
                }
            })
            Game.findOne({_id: req.params.gid}).
            exec(function (err, g) {
                if (err) return handleError(err);
                g.remove()
                res.json({message: "unsend game request sent"})
            })
        } else {
            res.status(400).json("game does not exists in pending games sent of original sender.")
        }
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Create one user
const Joi = require('joi');
const schema = Joi.object({
    username: Joi.string().min(4).max(255).required(),
    password: Joi.string().min(4).max(1024).required(),
  });
const bcrypt = require('bcrypt');
const { error } = require('console')

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
        icon: "mochi",
        gold: 0,
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
    if (req.body.username) { // check username
        // validate user
        const { error } = schema.validate({username: req.body.username, password: req.body.password});
        if(error){
            return res.status(400).json({ message: error.details[0].message });
        }

        // check if user already exists
        const isUserExist = await User.findOne({ username: req.body.username });
        if(isUserExist){
            return res.status(400).json({ message: "Username already exists" });
        }
        res.user.username = req.body.username
    }
    if (req.body.password) { // check password
        // validate user
        const { error } = schema.validate({username: req.body.username, password: req.body.password});
        if(error){
            return res.status(400).json({ message: error.details[0].message });
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        res.user.password = password
    }
    if (req.body.icon) { // check icon
        res.user.icon = req.body.icon
    }
    if (req.body.gold) { // check gold
        res.user.gold = req.body.gold
    }
    if (req.body.friends){ // check friends
        res.user.friends = req.body.friends
    }
    if (req.body.pending_friends_sent){ // check pending_friends_sent
        res.user.pending_friends_sent = req.body.pending_friends_sent
    }
    if (req.body.pending_friends_received){ // check pending_friends_received
        res.user.pending_friends_received = req.body.pending_friends_received
    }
    if (req.body.pending_games_sent){ // check pending_games_sent
        res.user.pending_games_sent = req.body.pending_games_sent
    }
    if (req.body.pending_games_received){ // check pending_games_received
        res.user.pending_games_received = req.body.pending_games_received
    }
    if (req.body.games){ // check games
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

// // Delete all users
// router.delete('/', async (req, res) => {
//     try {
//         await User.deleteMany()
//         res.json({ message: 'Deleted All Users' })
//     } catch(err) {
//         res.status(500).json({ message: err.message })
//     }
// })

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