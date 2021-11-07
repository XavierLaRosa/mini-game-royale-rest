// require express and schema dependencies
const express = require('express')
const router = express.Router()
const User = require('../models/user')

/*  Get All Users
    - send nothing
    - returns list of all users
    - requires token
*/
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/*  Get One User
    - send id
    - returns user with matching id
*/
router.get('/:id', getUser, async (req, res) => {
    User.findOne({ _id: res.user._id })
        .populate('friends', ['username','icon'])
        .exec(function (err, u) {
            if (err) return handleError(err);
            res.user = u
            res.json(res.user)
        })
})

/*  Get List of Matching Users
    - send keyword
    - returns all users matching keyword for username field
*/
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

/*  Add Friend
    - send your id and the person you want to friend id
    - updates user friends list
    - returns success or error response
*/
router.put('/friends/add/sender/:id/receiver/:rid', getUser, async (req, res) => {
    try {
        if(res.user.friends.includes(req.params.rid)){
            res.json({message: "already friends"})
        } else if(res.user._id.equals(req.params.rid)){
            res.json({message: "cannot friend yourself"})
        } else {
            User.findOne({ _id: req.params.id}).
            exec(function (err, u) {
                if (err) return handleError(err);
                u.friends.push(req.params.rid)
                u.save()
                res.json({message: "friend added"})
            })
        }
    } catch {
        res.status(400).json({ message: err.message })
    }
})

/*  Remove Friend
    - send your id and friend you want to remove id
    - updates user friend list
    - return success or error response
*/
router.put('/friends/remove/sender/:id/receiver/:rid', getUser, async (req, res) => {
    try {
        if(res.user.friends.indexOf(req.params.rid) >= 0){
            res.user.friends.splice(res.user.friends.indexOf(req.params.rid), 1)
            res.user.save()
            res.json({message: "removed friend"})
        } else {
            res.status(500).json({ message: "friends do not match" })
        }

    } catch {
        res.status(400).json({ message: err.message })
    }
})

/* Create One User
    - send username and password
    - returns success or error response
*/
const Joi = require('joi');
const schema = Joi.object({
    username: Joi.string().min(4).max(255).required(),
    password: Joi.string().min(4).max(1024).required(),
  });
const bcrypt = require('bcrypt');
const { error } = require('console')

router.post('/', async (req, res) => {
    try {
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
            friends: []
        })
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

/*  Login User
    - send username and password
    - returns success or error response
*/
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

/*  Update One User
    - send user data
    - returns success or error response
*/
router.put('/:id', getUser, async (req, res) => {
    try {
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
        if (req.body.icon) { res.user.icon = req.body.icon }
        if (req.body.gold) { res.user.gold = req.body.gold }
        if (req.body.friends){ res.user.friends = req.body.friends }
        if (req.body.categories){ res.user.categories = req.body.categories }
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch {
        res.status(400).json({ message: err.message })
    }
})

/* Delete One User
    - send id
    - returns success or error response
*/
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json({ message: 'Deleted This User' })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

/*  Delete all users
    - send nothing
    - return success or error response
*/
router.delete('/', async (req, res) => {
    try {
        await User.deleteMany()
        res.json({ message: 'Deleted All Users' })
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