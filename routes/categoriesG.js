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
        type: "categories",
        genre: req.body.genre,
        description: req.body.description,
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
    if(req.body.type){
        res.categoryG.type = req.body.type
    }
    if(req.body.genre){
        res.categoryG.genre = req.body.genre
    }
    if(req.body.description){
        res.categoryG.description = req.body.description
    }
    if(req.body.players){
        res.categoryG.players = req.body.players
    }
    if(req.body.answers){
        res.categoryG.answers = req.body.answers
    }
    if(req.body.is_done){
        res.categoryG.is_done = req.body.is_done
    }
    if(req.body.is_tie){
        res.categoryG.is_tie = req.body.is_tie
    }
    if(req.body.round){
        res.categoryG.round = req.body.round
    }
    if(req.body.current_player_turn_number){
        res.categoryG.current_player_turn_number = req.body.current_player_turn_number
    }
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

// Delete all games
router.delete('/', async (req, res) => {
    try {
        await CategoryG.deleteMany()
        res.json({ message: 'Deleted All CategoriesG' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Submit an answer
router.put('/:id/time/:seconds/submit-answer', getCategory, async (req, res) => {
    var entryExists = false
    for(var i = 0; i < res.categoryG.answers.length; i++){
        if(res.categoryG.answers[i].entry == req.body.entry.toLowerCase()){
            res.status(400).json({ message: "entry already exists" })
            entryExists = true
            break;
        }
    }
    if(!entryExists){
        res.categoryG.answers.push({
            entry: req.body.entry.toLowerCase(),
            player: req.body.player,
            points: Math.ceil(1000/req.params.seconds),
            up_votes: req.body.up_votes,
            down_votes: req.body.down_votes,
            max_votes: req.body.max_votes,
            approved: req.body.approved
        })
        try {
            const updatedcategory = await res.categoryG.save()
            res.json(updatedcategory)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
})

// Accept an answer
router.put('/:id/accept-answer/:answer', getCategory, async (req, res) => {
    for(var i = 0; i<res.categoryG.answers.length; i++){
        if(res.categoryG.answers[i].entry == req.params.answer.toLowerCase()){
            if(!res.categoryG.answers[i].approve){
                console.log("found answer: ", res.categoryG.answers[i])
                res.categoryG.answers[i].up_votes = res.categoryG.answers[i].up_votes + 1
                if(res.categoryG.answers[i].up_votes >= Math.floor(res.categoryG.answers[i].max_votes/2)){
                    res.categoryG.answers[i].approved = true
                    console.log("after found answer: ", res.categoryG.answers[i])
                }
                try {
                    const updatedcategory = await res.categoryG.save()
                    res.json(updatedcategory)
                } catch (err) {
                    res.status(400).json({ message: err.message })
                }
                break;
            } else {
                res.status(400).json({ message: "answer has already been approved." })
            }
        }
    }
})

// Decline an answer
router.put('/:id/decline-answer/:answer', getCategory, async (req, res) => {
    for(var i = 0; i<res.categoryG.answers.length; i++){
        if(res.categoryG.answers[i].entry == req.params.answer.toLowerCase()){
            if(!res.categoryG.answers[i].approved){
                console.log("found answer: ", res.categoryG.answers[i])
                res.categoryG.answers[i].down_votes = res.categoryG.answers[i].down_votes + 1
                if(res.categoryG.answers[i].down_votes > Math.floor(res.categoryG.answers[i].max_votes/2)){
                    res.categoryG.answers = res.categoryG.answers.splice(i+1, 1);
                    console.log("deleted, answers: ", res.categoryG.answers)
                }
                try {
                    const updatedcategory = await res.categoryG.save()
                    res.json(updatedcategory)
                } catch (err) {
                    res.status(400).json({ message: err.message })
                }
                break;
            } else{
                res.status(400).json({ message: "answer has already been approved." })
                break;
            }
        }
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