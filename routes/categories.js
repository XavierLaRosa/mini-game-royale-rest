// require express and schema dependencies
const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Answer = require('../models/answer')
const User = require('../models/user')
const { findById } = require('../models/category')

/*  Get All Categories
    - send nothing
    - returns all category games
*/
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
        res.json(categories)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/*  Get One Category Game
    - send category game id
    - returns matching category game
*/
router.get('/:id', getCategory, async (req, res) => {
    res.json(res.category)
})

/*  Create Category Game
    - send genre, description, and players
    - returns new game
*/
router.post('/', async (req, res) => {
    try {
        const category = new Category({
            genre: req.body.genre,
            description: req.body.description,
            players: req.body.players,
            answers: [],
            is_done: false,
            is_tie: false,
            round: 1,
            current_player_turn_number: 1
        })
        const newcategory = await category.save()

        for(let i = 0; i < req.body.players.length; i++) {
            const user = await User.findById(req.body.players[i].user_id)
            if(user) {
                user.categories.push(newcategory)
                user.save()
            }
        }
        res.status(201).json(newcategory)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

/*  Update Category Game
    - send game info
    - returns updated game
*/
router.put('/:id', getCategory, async (req, res) => {
    try {
        if(req.body.genre){ res.category.genre = req.body.genre }
        if(req.body.description){ res.category.description = req.body.description }
        if(req.body.players){ res.category.players = req.body.players }
        if(req.body.answers){ res.category.answers = req.body.answers }
        if(req.body.is_done){ res.category.is_done = req.body.is_done }
        if(req.body.is_tie){ res.category.is_tie = req.body.is_tie }
        if(req.body.round){ res.category.round = req.body.round }
        if(req.body.current_player_turn_number){ res.category.current_player_turn_number = req.body.current_player_turn_number }
        const updatedcategory = await res.category.save()
        res.json(updatedcategory)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

/*  Delete Category Game
    - send game id
    - returns success or error response
*/
router.delete('/:id', getCategory, async (req, res) => {
    try {
        await res.category.remove()
        res.json({ message: 'Deleted This category' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

/*  Delete All Games
    - send nothing
    - returns success or error response
*/
router.delete('/', async (req, res) => {
    try {
        await Category.deleteMany()
        res.json({ message: 'Deleted All Categories' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

/*  Submit Answers
    - send array answers with each object having entry, time, and player
    - returns updated category
*/
router.put('/:id/submit-answers', getCategory, async (req, res) => {
    try {
        for(var i = 0; i<req.body.answers.length; i++){
            const answer = new Answer({
                points: calculatePoints(req.body.answers[i].entry, req.body.answers[i].time),
                up_votes: [],
                down_votes: [],
                max_votes: res.category.players.length - 1,
                approved: false,
                pending: true,
                player: req.body.player
            })
            const newAnswer = await answer.save()
            res.category.answers.push(newAnswer)
        }
        const updatedCategory = await res.category.save()
        res.json(updatedCategory)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

/*  Up Vote Answer
    - send game id, answer id and your user id
    - configure answer object and save category
    - returns updated category object
*/
router.put('/:id/up-vote/:aid/:uid', getCategory, async (req, res) => {
    try {
        // check if answer id exists in answers
        let index = -1
        res.category.answers.forEach((a, i) => {
            if(a._id.equals(req.params.aid)) {
                index = i
            }
        })

        // check if id doesnt exist in answer up_votes and <= max votes
        const answer = await Answer.findById(req.params.aid)
        if(answer && answer.up_votes.indexOf(req.params.uid) < 0 && ((answer.up_votes.length + answer.down_votes.length - 1) <= answer.max_votes)) {
            // add id to answer up_votes
            answer.up_votes.push(req.params.uid)
            answer.pending = getAnswerStatus(answer).pending
            answer.approved = getAnswerStatus(answer).approved
            res.category.answers[index] = answer
            answer.save()
            const updatedCategory = await res.category.save()
            res.json(updatedCategory)
        } else {
            res.status(400).json({ message: "could not up vote this answer" })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

/*  Down Vote Answer
    - send game id, answer id and your user id
    - configure answer object and save category
    - returns updated category object
*/
router.put('/:id/down-vote/:aid/:uid', getCategory, async (req, res) => {
    try {
        // check if answer id exists in answers
        let index = -1
        res.category.answers.forEach((a, i) => {
            if(a._id.equals(req.params.aid)) {
                index = i
            }
        })

        // check if id doesnt exist in answer down_votes and <= max votes
        const answer = await Answer.findById(req.params.aid)
        if(answer && answer.down_votes.indexOf(req.params.uid) < 0 && ((answer.up_votes.length + answer.down_votes.length - 1) <= answer.max_votes)) {
            // add id to answer down_votes
            answer.down_votes.push(req.params.uid)
            answer.pending = getAnswerStatus(answer).pending
            answer.approved = getAnswerStatus(answer).approved
            res.category.answers[index] = answer
            answer.save()
            const updatedCategory = await res.category.save()
            res.json(updatedCategory)
        } else {
            res.status(400).json({ message: "could not up vote this answer" })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Submit an answer
router.put('/:id/time/:seconds/submit-answer', getCategory, async (req, res) => {
    var entryExists = false
    for(var i = 0; i < res.category.answers.length; i++){
        if(res.category.answers[i].entry == req.body.entry.toLowerCase()){
            res.status(400).json({ message: "entry already exists" })
            entryExists = true
            break;
        }
    }
    if(!entryExists){
        res.category.answers.push({
            entry: req.body.entry.toLowerCase(),
            player: req.body.player,
            points: Math.ceil(1000/req.params.seconds),
            up_votes: req.body.up_votes,
            down_votes: req.body.down_votes,
            max_votes: req.body.max_votes,
            approved: req.body.approved
        })
        try {
            const updatedcategory = await res.category.save()
            res.json(updatedcategory)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
})

// Accept an answer
router.put('/:id/accept-answer/:answer', getCategory, async (req, res) => {
    for(var i = 0; i<res.category.answers.length; i++){
        if(res.category.answers[i].entry == req.params.answer.toLowerCase()){
            if(!res.category.answers[i].approve){
                console.log("found answer: ", res.category.answers[i])
                res.category.answers[i].up_votes = res.category.answers[i].up_votes + 1
                if(res.category.answers[i].up_votes >= Math.floor(res.category.answers[i].max_votes/2)){
                    res.category.answers[i].approved = true
                    console.log("after found answer: ", res.category.answers[i])
                }
                try {
                    const updatedcategory = await res.category.save()
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
    for(var i = 0; i<res.category.answers.length; i++){
        if(res.category.answers[i].entry == req.params.answer.toLowerCase()){
            if(!res.category.answers[i].approved){
                console.log("found answer: ", res.category.answers[i])
                res.category.answers[i].down_votes = res.category.answers[i].down_votes + 1
                if(res.category.answers[i].down_votes > Math.floor(res.category.answers[i].max_votes/2)){
                    res.category.answers = res.category.answers.splice(i+1, 1);
                    console.log("deleted, answers: ", res.category.answers)
                }
                try {
                    const updatedcategory = await res.category.save()
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

// Reusable function thats gets a single category, helpful for GET by id, UPDATE, DELETE
async function getCategory(req, res, next) {
    try {
      category = await Category.findById(req.params.id).populate('answers')
      if (category == null) {
        return res.status(404).json({ message: 'Cant find category'})
      }
    } catch(err){
      return res.status(500).json({ message: err.message })
    }
  
    res.category = category
    next() // move onto the next section of code (the rest of the specific route method logic)
  }
module.exports = router

function calculatePoints(entry, time) {
    return Math.ceil(1000/time) + entry.length * 50
}

function getAnswerStatus(answer) {
    let response = { pending: true, approved: false }
    const up_points = answer.up_votes.length
    const down_points = answer.down_votes.length
    const max = answer.max_votes

    if(up_points + down_points == max) {
        response.pending = false
    } else {
        response.pending = true
    }
    if(!response.pending && up_points >= down_points) {
        response.approved = true
    } else if(!response.pending && down_points > up_points) {
        response.approved = false
    } else {
        response.approved = false
    }

    return response
}