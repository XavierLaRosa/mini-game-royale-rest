// require express and schema dependencies
const express = require('express')
const router = express.Router()
const Session = require('../models/session')

// Get all sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find()
        res.json(sessions)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one session
router.get('/:id', getSession, async (req, res) => {

    const s = await Session.findOne({ _id: req.params.id })
    .populate('player_1_id', 'username').
    populate('player_2_id', 'username').
    populate('game_id').
    populate({ 
        path: 'game_id',
        populate: {
          path: 'genre_id',
          model: 'Category',
          select: 'category'
        } 
    }).
    populate({ 
        path: 'game_id',
        populate: {
          path: 'player_1_id',
          model: 'User',
          select: 'username'
        } 
    }).
    populate({ 
        path: 'game_id',
        populate: {
          path: 'player_2_id',
          model: 'User',
          select: 'username'
        } 
    }).
    populate({ 
        path: 'game_id',
        populate: {
          path: 'current_turn_id',
          model: 'User',
          select: 'username'
        } 
    })
    res.session = s
    res.json(res.session)
})

// Create one session
router.post('/', async (req, res) => {
    const session = new Session({
        player_1_id: req.body.player_1_id,
        player_1_wins: 0,
        player_2_id: req.body.player_2_id,
        player_2_wins: 0,
      })
    
      try {
        const newSession = await session.save()
        res.status(201).json(newSession)
      } catch (err) {
        res.status(400).json({ message: err.message })
      }
})

// Update one session
router.put('/:id', getSession, async (req, res) => {
    res.session.player_1_wins = req.body.player_1_wins
    res.session.player_2_wins = req.body.player_2_wins
    res.session.game_id = req.body.game_id
    
    try {
        const updatedSession = await res.session.save()
        res.json(updatedSession)
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Delete one session
router.delete('/:id', getSession, async (req, res) => {
    try {
        await res.session.remove()
        res.json({ message: 'Deleted This session' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Reusable function thats gets a single session, helpful for GET by id, UPDATE, DELETE
async function getSession(req, res, next) {
    try {
      session = await Session.findById(req.params.id)
      if (session == null) {
        return res.status(404).json({ message: 'Cant find session'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.session = session
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