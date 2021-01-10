// require express and schema dependencies
const express = require('express')
const router = express.Router()
const CategoryG = require('../models/categoryG')

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await CategoryG.find()
        res.json(categories)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// Get one categoryG
router.get('/:id', getCategory, async (req, res) => {
    res.json(res.categoryG)
})

// Create one categoryG
router.post('/', async (req, res) => {
    const categoryG = new CategoryG({
        genre: req.body.genre,
        players: req.body.players,
        answers: [],
        is_done: false,
        is_tie: false,
        round: 1,
        current_player_turn_number: 1
    })
    
    try {
        const newcategory = await categoryG.save()
        res.status(201).json(newcategory)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Update one categoryG
router.put('/:id', getCategory, async (req, res) => {
    res.categoryG = req.body

    try {
        const updatedcategory = await res.categoryG.save()
        res.json(updatedcategory)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Delete one categoryG
router.delete('/:id', getCategory, async (req, res) => {
    try {
        await res.categoryG.remove()
        res.json({ message: 'Deleted This categoryG' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Reusable function thats gets a single categoryG, helpful for GET by id, UPDATE, DELETE
async function getCategory(req, res, next) {
    try {
      categoryG = await CategoryG.findById(req.params.id)
      if (categoryG == null) {
        return res.status(404).json({ message: 'Cant find categoryG'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.categoryG = categoryG
    next() // move onto the next section of code (the rest of the specific route method logic)
  }
module.exports = router