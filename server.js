// reference environment variables using dotenv package
require('dotenv').config()

// install server dependencies
const express = require('express')
const app = express()
const mongoose = require('mongoose')
var cors = require('cors')

// connect to mongodb database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

// import token
const verifyToken = require("./routes/validate-token");

// tell express to accept JSON as the data format
app.use(express.json())

// enable cors
app.use(cors({
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}))

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const gamesRouter = require('./routes/games')
app.use('/games', verifyToken, gamesRouter)

const sessionsRouter = require('./routes/sessions')
app.use('/sessions', verifyToken, sessionsRouter)

const categoriesRouter = require('./routes/categories')
app.use('/categories', verifyToken, categoriesRouter)

// test out server is working
let server = app.listen(process.env.PORT || 3000, () => {
    console.log('server started')
    console.log("listening at port: ", server.address().port)
})
