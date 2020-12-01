// require express and schema dependencies
const express = require('express')
const router = express.Router()
const Game = require('../models/game')

// Get all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find()
        res.json(games)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one game
router.get('/:id', getGame, async (req, res) => {
    Game.findOne({ _id: res.game._id })
    .populate('genre_id', 'cateogory').
    populate('current_turn_id', 'username').
    populate('player_1_id', 'username').
    populate('player_2_id', 'username').
    exec(function (err, g) {
        if (err) return handleError(err);
        res.game = g
        res.json(res.game)
    })
})

// Create one game
router.post('/', async (req, res) => {
    const game = new Game({
        name: req.body.name,
        session_id: req.body.session_id,
        genre_id: req.body.genre_id,
        current_turn_id: req.body.current_turn_id,
        player_1_id: req.body.player_1_id,
        player_1_points: 0,
        player_2_id: req.body.player_2_id,
        player_2_points: 0,
        verified_answers: [],
        round: 0,
        max_round: req.body.max_round,
        active: req.body.active
      })
    
    try {
        const newGame = await game.save()
        res.status(201).json(newGame)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Update one game
router.put('/:id', getGame, async (req, res) => {
    res.game.current_turn_id = req.body.current_turn_id
    res.game.player_1_points = req.body.player_1_points
    res.game.player_2_points = req.body.player_2_points
    res.game.round = req.body.round
    res.game.max_round = req.body.max_round

    try {
        const updatedGame = await res.game.save()
        res.json(updatedGame)
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Delete one game
router.delete('/:id', getGame, async (req, res) => {
    try {
        await res.game.remove()
        res.json({ message: 'Deleted This game' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Reusable function thats gets a single game, helpful for GET by id, UPDATE, DELETE
async function getGame(req, res, next) {
    try {
      game = await Game.findById(req.params.id)
      if (game == null) {
        return res.status(404).json({ message: 'Cant find game'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.game = game
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