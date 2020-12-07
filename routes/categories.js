// require express and schema dependencies
const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Game = require('../models/game')
var stringSimilarity = require('string-similarity');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
        res.json(categories)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// Get one category
router.get('/:id', getCategory, async (req, res) => {
    res.json(res.category)
})

// Check if answer is right
router.get('/:id/submit/:submission/game/:gid', getCategory, async (req, res) => {
    if(res.category.answers.includes(req.params.submission.toLowerCase())){
        Game.findOne({ _id: req.params.gid}).
        exec(function (err, g) {
            if (err) return handleError(err);
            if(!g.verified_answers.includes(req.params.submission.toLowerCase())){
                g.verified_answers.push(req.params.submission)
                g.save()
                res.json({
                    category: res.category.category,
                    answer: req.params.submission.toLowerCase(),
                    is_valid: true,
                    message: `${req.params.submission.toLowerCase()} is a ${res.category.category} !`,
                    game: g
                })
            } else {
                res.json({
                    category: res.category.category,
                    answer: req.params.submission.toLowerCase(),
                    is_valid: false,
                    message: `${req.params.submission.toLowerCase()} was already used!`
                })
            }
        })
    } else {
        res.json({
            category: res.category.category,
            answer: req.params.submission.toLowerCase(),
            is_valid: false,
            message: `${req.params.submission.toLowerCase()} is not a ${res.category.category} !`
        })
    }    
})

// Add a new entry
router.get('/:id/new-entry/:entry', getCategory, async (req, res) => {
    const entry = req.params.entry.toLowerCase()
    var mssg = `${entry} was not added into ${res.category.category}, either it already exists or something similar enough to it already does.`
    var is_valid = false
    var highestSimilarity = 0
    for(var i = 0; i < res.category.answers.length; i++) {
        var pair = res.category.answers[i]
        var key = pair.key
        var value = pair.value
        var similarity = stringSimilarity.compareTwoStrings(pair.key, entry)
        if(similarity > highestSimilarity){
            highestSimilarity = similarity
        }
        if(similarity > 0.5 && similarity < 1.0 && !value.includes(entry)) { // new entry in value array
            res.category.answers[i].value.push(entry)
            mssg = `${entry} was added into list of accepted entries related to ${key} in ${res.category.category}`
            is_valid = true
            if(key.length > entry.length){ // update key if entry is shorter
                res.category.answers[i].key = entry
            }
            break;  
        } else if(similarity < 0.5 && !value.includes(entry)) { // maybe values list gives a better score
            for(var j = 0; j < value.length; j++) {
                var v = value[j]
                if(stringSimilarity.compareTwoStrings(v, entry) > 0.5){
                    res.category.answers[i].value.push(entry)
                    mssg = `${entry} was added into list of accepted entries related to ${key} in ${res.category.category}`
                    is_valid = true
                    if(key.length > entry.length){ // update key if entry is shorter
                        res.category.answers[i].key = entry
                    }
                    break;  
                }
            };
        } 
    }
    if(res.category.answers.length == 0){
        mssg = `${entry} added as first new entry in ${res.category.category}`
        is_valid = true
        res.category.answers = [{key: entry, value: [entry]}]
    } else if(highestSimilarity < 0.5){ // new key
        mssg = `${entry} added as new entry in ${res.category.category}`
        is_valid = true
        res.category.answers.push({key: entry, value: [entry]})
    }
    res.category.save()
    res.json({
        message: mssg,
        is_valid: is_valid,
        data: res.category
    })
})

// Create one category
router.post('/', async (req, res) => {

    // check if user already exists
    const isCategoryExist = await Category.findOne({ category: req.body.category });
    if(isCategoryExist){
        return res.status(400).json({ message: "Category already exists" });
    } else {
        const category = new Category({
            category: req.body.category,
            answers: []
        })
        
        try {
            const newcategory = await category.save()
            res.status(201).json(newcategory)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
})

// Update one category
router.put('/:id', getCategory, async (req, res) => {
    res.category.answers = req.body.answers

    try {
        const updatedcategory = await res.category.save()
        res.json(updatedcategory)
    } catch {
        res.status(400).json({ message: err.message })
    }
})

// Delete one category
router.delete('/:id', getCategory, async (req, res) => {
    try {
        await res.category.remove()
        res.json({ message: 'Deleted This category' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Reusable function thats gets a single category, helpful for GET by id, UPDATE, DELETE
async function getCategory(req, res, next) {
    try {
      category = await Category.findById(req.params.id)
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