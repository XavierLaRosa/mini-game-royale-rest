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
    var highestSimilarity = 0
    for(var i = 0; i < res.category.answers.length; i++) {
        console.log("high: ", highestSimilarity)
        var pair = res.category.answers[i]
        var key = pair.key
        var value = pair.value
        var similarity = stringSimilarity.compareTwoStrings(pair.key, entry);
        if(similarity > highestSimilarity){
            highestSimilarity = similarity
            console.log("high 2: ", highestSimilarity)
        }
        if(similarity > 0.7 && similarity < 1.0 && !value.includes(entry)) { // new entry in value array
            res.category.answers[i].value.push(entry)
            if(key.length > entry.length){ // update key if entry is shorter
                console.log("found")
                res.category.answers[i].key = entry
            }  
        } 
    }
    if(res.category.answers.length == 0){
        res.category.answers = [{key: entry, value: [entry]}]
    } else if(highestSimilarity < 0.7){ // new key
        res.category.answers.push({key: entry, value: [entry]})
    }
    res.category.save()
    res.json({
        message: `mssg`,
        is_valid: true,
        data: res.category
    })



    // console.log("pre cat: ", res.category)
    // if(!res.category.answers.includes(req.params.entry.toLowerCase())){
    //     res.category.answers.push(req.params.entry.toLowerCase())
    //     res.category.save()
    //     res.json({
    //         message: `New entry added to ${res.category.category}!`,
    //         is_valid: true,
    //         data: res.category
    //     })
    // } else {
    //     res.json({message: `Entry already exists in ${res.category.category}.`, is_valid: false})
    // }
})

// helper method to see if answer is identical
function isIdentical(old_entry, new_entry) {
    if(old_entry.toLowerCase().equals(new_entry.toLowerCase())){ // if exact match
        console.log("exact!", old_entry, new_entry)
    }
    if(new_entry.slice(0, -2).equals(old_entry) || old_entry.slice(0, -2).equals(new_entry)){ // if new is same as old but with 'es' at end of word, vice versa
        console.log("word may contain 'es'!", old_entry, new_entry)
    }
    if(new_entry.slice(0, -1).equals(old_entry) || old_entry.slice(0, -1).equals(new_entry)){ // if new is same as old but with 's' at end of word, vice versa
        console.log("word may contain 's'!", old_entry, new_entry)
    }
    if(old_entry.length > 4 && new_entry.length > 4){ // if both are 4 characters more
        console.log("greater than 4!", old_entry, new_entry)
    }
}

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