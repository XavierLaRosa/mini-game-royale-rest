// require express and schema dependencies
const express = require('express')
const router = express.Router()
const Category = require('../models/category')

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
router.get('/:id/submit/:submission', getCategory, async (req, res) => {
    if(res.category.answers.includes(req.params.submission.toLowerCase())){
        res.json({
            category: res.category.category,
            answer: req.params.submission.toLowerCase(),
            is_valid: true
        })
    } else {
        res.json({
            category: res.category.category,
            answer: req.params.submission.toLowerCase(),
            is_valid: false
        })
    }    
})

// Create one category
router.post('/', async (req, res) => {
    const category = new Category({
        category: req.body.category,
        answers: req.body.answers
      })
    
    try {
        const newcategory = await category.save()
        res.status(201).json(newcategory)
    } catch (err) {
        res.status(400).json({ message: err.message })
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